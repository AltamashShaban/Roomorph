/**
 * Generation service.
 *
 * PROTOTYPE ONLY: when EXPO_PUBLIC_OPENAI_API_KEY is set, the app calls OpenAI
 * directly. That key ships inside the app bundle — fine on your own phone for
 * testing, NEVER for a store build. Production moves this call into a Supabase
 * Edge Function (auth + credits + moderation), and the app calls that instead.
 *
 * Without a key, the app runs in MOCK mode: it waits a few seconds and returns
 * the style's sample photo so the whole flow can be demoed.
 */
import { QUALITY, type Quality } from '@/config/options';
import { buildPrompt } from '@/lib/prompt';
import { readBase64, writeBase64Image } from '@/lib/image';
import { toLocalUri } from '@/lib/image-source';

export const OPENAI_MODEL = 'gpt-image-2'; // verified against OpenAI docs, Sept 2026
const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY;

export const isLiveAI = () => !!API_KEY && API_KEY.startsWith('sk-');

export type GenerateInput = {
  id: string;
  photoUri: string;
  width: number;
  height: number;
  styleId: string;
  userPrompt?: string;
  quality: Quality;
  signal?: AbortSignal;
};

export type GenerateOutput = { afterUri: string; mock: boolean; latencyMs: number };

export class GenerationError extends Error {}

export async function generateRedesign(input: GenerateInput): Promise<GenerateOutput> {
  const started = Date.now();

  if (!isLiveAI()) {
    await sleep(4500, input.signal);
    return { afterUri: `sample:${input.styleId}`, mock: true, latencyMs: Date.now() - started };
  }

  const prompt = buildPrompt(input.styleId, input.userPrompt);
  const base64 = await readBase64(await toLocalUri(input.photoUri));
  const landscape = input.width >= input.height;

  let res: Response;
  try {
    res = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      signal: input.signal,
      headers: {
        Authorization: `Bearer ${API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        prompt,
        images: [{ image_url: `data:image/jpeg;base64,${base64}` }],
        size: landscape ? '1536x1024' : '1024x1536',
        quality: QUALITY[input.quality].apiQuality,
        output_format: 'jpeg',
        n: 1,
      }),
    });
  } catch (e: any) {
    if (e?.name === 'AbortError') throw new GenerationError('Cancelled');
    throw new GenerationError('Network problem — check your connection and try again.');
  }

  const json: any = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = json?.error?.message ?? `OpenAI error (${res.status})`;
    if (json?.error?.code === 'moderation_blocked' || /safety/i.test(msg)) {
      throw new GenerationError("That request couldn't be generated. Try a different photo or details.");
    }
    throw new GenerationError(msg);
  }

  const b64 = json?.data?.[0]?.b64_json;
  if (!b64) throw new GenerationError('No image came back. Please try again.');

  const afterUri = writeBase64Image(b64, `${input.id}-after.jpg`);
  return { afterUri, mock: false, latencyMs: Date.now() - started };
}

function sleep(ms: number, signal?: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    const t = setTimeout(resolve, ms);
    signal?.addEventListener('abort', () => {
      clearTimeout(t);
      reject(new GenerationError('Cancelled'));
    });
  });
}
