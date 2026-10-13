/**
 * POST /functions/v1/generate
 * Body: { clientId, image (base64 JPEG), width, height, styleId, userPrompt?, quality }
 *
 * 1. Checks who is calling (Supabase session token).
 * 2. Takes the credits atomically (refused if the balance is too low).
 * 3. Builds the prompt from the shared catalogue and calls the OpenAI image API.
 * 4. On failure refunds the credits; on success stores before/after images.
 * Returns { generationId, image (base64 JPEG), credits }.
 *
 * Secrets: OPENAI_API_KEY (set with `supabase secrets set`).
 * SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are provided by Supabase.
 */
import { createClient } from 'npm:@supabase/supabase-js@2';

import { buildPrompt, OPENAI_IMAGE_MODEL, QUALITY_SPEC, sanitizeUserPrompt, STYLE_PROMPTS, type QualityId } from '../_shared/catalog.ts';

const admin = createClient(Deno.env.get('SUPABASE_URL')!, Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!, {
  auth: { persistSession: false },
});
const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY');
const MAX_IMAGE_BASE64 = 8 * 1024 * 1024; // ~6 MB JPEG; the app sends ≤1536px images

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function json(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: { ...cors, 'Content-Type': 'application/json' } });
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors });
  if (req.method !== 'POST') return json(405, { error: 'method_not_allowed' });
  if (!OPENAI_API_KEY) return json(500, { error: 'server_misconfigured', message: 'Generation is not set up yet.' });

  // ---- who is calling
  const token = req.headers.get('Authorization')?.replace(/^Bearer\s+/i, '');
  const { data: auth } = token ? await admin.auth.getUser(token) : { data: { user: null } };
  const user = auth?.user;
  if (!user) return json(401, { error: 'unauthorized', message: 'Please sign in again.' });

  // ---- validate input
  const body = await req.json().catch(() => null);
  const clientId = typeof body?.clientId === 'string' ? body.clientId.slice(0, 64) : '';
  const image = typeof body?.image === 'string' ? body.image : '';
  const styleId = typeof body?.styleId === 'string' ? body.styleId : '';
  const quality = body?.quality as QualityId;
  const width = Number(body?.width) || null;
  const height = Number(body?.height) || null;
  const userPrompt = sanitizeUserPrompt(body?.userPrompt);

  if (!clientId || !image || !STYLE_PROMPTS[styleId] || !(quality in QUALITY_SPEC)) {
    return json(400, { error: 'bad_request', message: 'Something is missing. Please start again.' });
  }
  if (image.length > MAX_IMAGE_BASE64) return json(413, { error: 'too_large', message: 'That photo is too large.' });

  const cost = QUALITY_SPEC[quality].credits;

  // ---- user's words go through moderation first (free endpoint); the image model moderates the photo itself
  if (userPrompt) {
    const flagged = await isFlagged(userPrompt);
    if (flagged) return json(422, { error: 'moderation_blocked', message: 'Those details can’t be used. Try rewording them.' });
  }

  // ---- record the request and take the credits
  const { data: gen, error: insertError } = await admin
    .from('generations')
    .insert({ user_id: user.id, client_id: clientId, style_id: styleId, user_prompt: userPrompt || null, quality, width, height })
    .select('id')
    .single();
  if (insertError || !gen) {
    const duplicate = insertError?.code === '23505';
    return json(duplicate ? 409 : 500, {
      error: duplicate ? 'duplicate' : 'server_error',
      message: duplicate ? 'This redesign is already being made.' : 'Something went wrong. Please try again.',
    });
  }

  const { data: balanceAfterSpend, error: spendError } = await admin.rpc('spend_credits', {
    p_user: user.id,
    p_amount: cost,
    p_generation: gen.id,
  });
  if (spendError) {
    await admin.from('generations').delete().eq('id', gen.id);
    if (spendError.message.includes('insufficient_credits')) {
      return json(402, { error: 'insufficient_credits', message: 'You need more credits for this.', credits: await currentCredits(user.id) });
    }
    return json(500, { error: 'server_error', message: 'Something went wrong. Please try again.' });
  }
  await admin.from('generations').update({ credits_spent: cost }).eq('id', gen.id);

  // ---- generate
  const started = Date.now();
  const result = await callOpenAI({ image, prompt: buildPrompt(styleId, userPrompt), quality, landscape: (width ?? 1) >= (height ?? 1) });

  if (!result.ok) {
    const credits = await admin.rpc('grant_credits', {
      p_user: user.id,
      p_amount: cost,
      p_reason: 'refund',
      p_ref: `refund:${gen.id}`,
      p_generation: gen.id,
    });
    await admin.from('generations').update({ status: 'failed', error: result.detail.slice(0, 500) }).eq('id', gen.id);
    return json(result.status, { error: result.code, message: result.message, credits: credits.data ?? balanceAfterSpend + cost, refunded: cost });
  }

  // ---- store both images (best effort: the user still gets their result if storage hiccups)
  const beforePath = `${user.id}/${gen.id}-before.jpg`;
  const afterPath = `${user.id}/${gen.id}-after.jpg`;
  const [beforeUp, afterUp] = await Promise.all([
    admin.storage.from('redesigns').upload(beforePath, decodeBase64(image), { contentType: 'image/jpeg', upsert: true }),
    admin.storage.from('redesigns').upload(afterPath, decodeBase64(result.b64), { contentType: 'image/jpeg', upsert: true }),
  ]);

  await admin
    .from('generations')
    .update({
      status: 'succeeded',
      latency_ms: Date.now() - started,
      before_path: beforeUp.error ? null : beforePath,
      after_path: afterUp.error ? null : afterPath,
    })
    .eq('id', gen.id);

  return json(200, { generationId: gen.id, image: result.b64, credits: balanceAfterSpend });
});

type OpenAIResult =
  | { ok: true; b64: string }
  | { ok: false; status: number; code: string; message: string; detail: string };

async function callOpenAI(opts: { image: string; prompt: string; quality: QualityId; landscape: boolean }): Promise<OpenAIResult> {
  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OPENAI_IMAGE_MODEL,
        prompt: opts.prompt,
        images: [{ image_url: `data:image/jpeg;base64,${opts.image}` }],
        size: opts.landscape ? '1536x1024' : '1024x1536',
        quality: QUALITY_SPEC[opts.quality].apiQuality,
        output_format: 'jpeg',
        n: 1,
      }),
    });
  } catch (e) {
    return { ok: false, status: 502, code: 'upstream_unreachable', message: 'The AI service couldn’t be reached. Please try again.', detail: String(e) };
  }

  const body = await res.json().catch(() => null);
  if (!res.ok) {
    const detail = body?.error?.message ?? `OpenAI ${res.status}`;
    if (body?.error?.code === 'moderation_blocked' || /safety/i.test(detail)) {
      return { ok: false, status: 422, code: 'moderation_blocked', message: 'That request couldn’t be generated. Try a different photo or details.', detail };
    }
    return { ok: false, status: 502, code: 'upstream_error', message: 'The redesign didn’t work this time. Please try again.', detail };
  }

  const b64 = body?.data?.[0]?.b64_json;
  if (!b64) return { ok: false, status: 502, code: 'upstream_empty', message: 'No image came back. Please try again.', detail: 'empty data' };
  return { ok: true, b64 };
}

async function isFlagged(text: string) {
  try {
    const res = await fetch('https://api.openai.com/v1/moderations', {
      method: 'POST',
      headers: { Authorization: `Bearer ${OPENAI_API_KEY}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'omni-moderation-latest', input: text }),
    });
    const body = await res.json();
    return !!body?.results?.[0]?.flagged;
  } catch {
    return false; // moderation outage shouldn't block; the image model still moderates
  }
}

async function currentCredits(userId: string) {
  const { data } = await admin.from('profiles').select('credits').eq('id', userId).single();
  return data?.credits ?? 0;
}

function decodeBase64(b64: string) {
  const bin = atob(b64);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return bytes;
}
