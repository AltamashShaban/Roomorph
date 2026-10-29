/**
 * Calls to the Roomorph backend (Supabase). Only used when the backend is
 * configured; see src/lib/supabase.ts.
 */
import { FunctionsHttpError } from '@supabase/supabase-js';

import type { Quality } from '@/config/options';
import type { ShopItem } from '@/config/shop';
import { supabase } from '@/lib/supabase';

const BUCKET = 'redesigns';
const SIGNED_URL_SECONDS = 60 * 60 * 24 * 7;

function client() {
  if (!supabase) throw new Error('Backend not configured');
  return supabase;
}

export class ServerError extends Error {
  constructor(
    message: string,
    public code: string,
    public credits?: number,
    public refunded?: number,
  ) {
    super(message);
  }
}

export async function fetchCredits(): Promise<number | null> {
  const { data, error } = await client().from('profiles').select('credits').single();
  if (error) return null;
  return data.credits;
}

export type ServerGenerateInput = {
  clientId: string;
  imageBase64: string;
  width: number;
  height: number;
  styleId: string;
  userPrompt?: string;
  quality: Quality;
  signal?: AbortSignal;
};

export async function generateOnServer(input: ServerGenerateInput) {
  const { data, error } = await client().functions.invoke('generate', {
    method: 'POST',
    signal: input.signal,
    timeout: 170_000,
    body: {
      clientId: input.clientId,
      image: input.imageBase64,
      width: input.width,
      height: input.height,
      styleId: input.styleId,
      userPrompt: input.userPrompt,
      quality: input.quality,
    },
  });

  if (error) {
    if (input.signal?.aborted) throw new ServerError('Cancelled', 'cancelled');
    if (error instanceof FunctionsHttpError) {
      const body = await error.context.json().catch(() => null);
      throw new ServerError(body?.message ?? 'Something went wrong. Please try again.', body?.error ?? 'server_error', body?.credits, body?.refunded);
    }
    throw new ServerError('Network problem. Check your connection and try again.', 'network');
  }

  return data as { generationId: string; image: string; credits: number; shopItems?: ShopItem[] };
}

export type RemoteRedesign = {
  remoteId: string;
  clientId: string;
  styleId: string;
  userPrompt?: string;
  quality: Quality;
  width: number;
  height: number;
  createdAt: number;
  beforeUrl?: string;
  afterUrl?: string;
  shopItems?: ShopItem[];
};

/** The signed-in user's finished redesigns, with temporary image links. */
export async function fetchRemoteHistory(): Promise<RemoteRedesign[] | null> {
  const { data, error } = await client()
    .from('generations')
    .select('id, client_id, style_id, user_prompt, quality, width, height, before_path, after_path, shop_items, created_at')
    .eq('status', 'succeeded')
    .order('created_at', { ascending: false })
    .limit(200);
  if (error || !data) return null;

  const paths = data.flatMap((g) => [g.before_path, g.after_path]).filter((p): p is string => !!p);
  const urls = new Map<string, string>();
  if (paths.length) {
    const { data: signed } = await client().storage.from(BUCKET).createSignedUrls(paths, SIGNED_URL_SECONDS);
    signed?.forEach((s) => s.path && s.signedUrl && urls.set(s.path, s.signedUrl));
  }

  return data.map((g) => ({
    remoteId: g.id,
    clientId: g.client_id,
    styleId: g.style_id,
    userPrompt: g.user_prompt ?? undefined,
    quality: g.quality,
    width: g.width ?? 1024,
    height: g.height ?? 1536,
    createdAt: new Date(g.created_at).getTime(),
    beforeUrl: g.before_path ? urls.get(g.before_path) : undefined,
    afterUrl: g.after_path ? urls.get(g.after_path) : undefined,
    shopItems: Array.isArray(g.shop_items) ? g.shop_items : undefined,
  }));
}

export async function deleteRemoteRedesign(remoteId: string, userId: string) {
  await client()
    .storage.from(BUCKET)
    .remove([`${userId}/${remoteId}-before.jpg`, `${userId}/${remoteId}-after.jpg`]);
  await client().from('generations').delete().eq('id', remoteId);
}
