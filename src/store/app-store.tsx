/**
 * App state: credits, onboarding flag, the in-progress "draft" redesign, and
 * history. Persisted locally with AsyncStorage.
 *
 * With the backend on (see src/lib/supabase.ts) the server owns credits and
 * history: the balance is fetched after sign in and after every generation,
 * and history merges in redesigns from the account (e.g. after a reinstall).
 * Without it, everything stays on the device as in the prototype.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

import { FREE_CREDITS, type Quality } from '@/config/options';
import { deleteRemoteRedesign, fetchCredits, fetchRemoteHistory, type RemoteRedesign } from '@/lib/backend';
import { deleteImage } from '@/lib/image';
import { isBackendEnabled } from '@/lib/supabase';
import { useAuth } from '@/store/auth';

export type Redesign = {
  id: string;
  beforeUri: string;
  afterUri: string;
  width: number;
  height: number;
  roomType?: string; // legacy — no longer collected
  styleId: string;
  userPrompt?: string;
  quality: Quality;
  mock: boolean;
  createdAt: number;
  /** id of the server copy (backend mode) */
  remoteId?: string;
};

export type Draft = {
  photoUri?: string;
  width?: number;
  height?: number;
  styleId?: string;
  /** true when the style was picked on Home before the photo (skip the style step) */
  presetStyle?: boolean;
  userPrompt?: string;
  quality: Quality;
};

type Persisted = { onboarded: boolean; credits: number; history: Redesign[] };

type Store = Persisted & {
  hydrated: boolean;
  draft: Draft;
  updateDraft: (patch: Partial<Draft>) => void;
  resetDraft: (keep?: Partial<Draft>) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
  /** true when the server owns credits and history */
  backend: boolean;
  spendCredits: (n: number) => boolean;
  addCredits: (n: number) => void;
  /** backend mode: set the balance the server reported */
  setServerCredits: (n: number) => void;
  /** backend mode: re-fetch balance and history */
  refresh: () => Promise<void>;
  addRedesign: (r: Redesign) => void;
  deleteRedesign: (id: string) => void;
  resetAll: () => void;
};

const KEY = 'roomorph:v2';
const EMPTY_DRAFT: Draft = { quality: 'standard' };
const DEFAULTS: Persisted = { onboarded: false, credits: FREE_CREDITS, history: [] };

const Ctx = createContext<Store | null>(null);

const isRemoteUri = (uri: string) => uri.startsWith('http');

/** Add account redesigns this device doesn't have, and refresh expiring image links. */
function mergeRemote(history: Redesign[], remote: RemoteRedesign[]): Redesign[] {
  const byClientId = new Map(remote.map((r) => [r.clientId, r]));
  const merged = history.map((h) => {
    const r = byClientId.get(h.id);
    if (!r) return h;
    byClientId.delete(h.id);
    return {
      ...h,
      remoteId: r.remoteId,
      beforeUri: isRemoteUri(h.beforeUri) && r.beforeUrl ? r.beforeUrl : h.beforeUri,
      afterUri: isRemoteUri(h.afterUri) && r.afterUrl ? r.afterUrl : h.afterUri,
    };
  });
  const added: Redesign[] = [...byClientId.values()]
    .filter((r) => r.beforeUrl && r.afterUrl)
    .map((r) => ({
      id: r.clientId,
      remoteId: r.remoteId,
      beforeUri: r.beforeUrl!,
      afterUri: r.afterUrl!,
      width: r.width,
      height: r.height,
      styleId: r.styleId,
      userPrompt: r.userPrompt,
      quality: r.quality,
      mock: false,
      createdAt: r.createdAt,
    }));
  return [...merged, ...added].sort((a, b) => b.createdAt - a.createdAt);
}

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<Persisted>(DEFAULTS);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const backend = isBackendEnabled();
  const { session } = useAuth();
  const userId = session?.user.id;
  const [serverCredits, setServerCredits] = useState<number | null>(null);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setData({ ...DEFAULTS, ...JSON.parse(raw) }))
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, hydrated]);

  const refresh = useCallback(async () => {
    if (!backend || !userId) return;
    const [credits, remote] = await Promise.all([fetchCredits(), fetchRemoteHistory()]);
    if (credits !== null) setServerCredits(credits);
    if (remote) setData((d) => ({ ...d, history: mergeRemote(d.history, remote) }));
  }, [backend, userId]);

  // Backend: load the account after sign in; forget it after sign out.
  const lastUser = useRef<string | undefined>(undefined);
  useEffect(() => {
    if (!backend || !hydrated) return;
    if (userId) {
      refresh();
    } else if (lastUser.current) {
      setServerCredits(null);
      setData((d) => {
        d.history.forEach((r) => {
          deleteImage(r.beforeUri);
          deleteImage(r.afterUri);
        });
        return { ...d, history: [] };
      });
    }
    lastUser.current = userId;
  }, [backend, hydrated, userId, refresh]);

  const updateDraft = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const resetDraft = useCallback((keep?: Partial<Draft>) => setDraft({ ...EMPTY_DRAFT, ...keep }), []);

  const credits = backend ? (serverCredits ?? 0) : data.credits;

  // Prototype only — in backend mode the server takes and refunds credits.
  const spendCredits = useCallback(
    (n: number) => {
      if (backend || data.credits < n) return false;
      setData((d) => ({ ...d, credits: d.credits - n }));
      return true;
    },
    [backend, data.credits],
  );

  const value = useMemo<Store>(
    () => ({
      ...data,
      credits,
      backend,
      hydrated,
      draft,
      setServerCredits,
      refresh,
      updateDraft,
      resetDraft,
      completeOnboarding: () => setData((d) => ({ ...d, onboarded: true })),
      resetOnboarding: () => setData((d) => ({ ...d, onboarded: false })),
      spendCredits,
      addCredits: (n) => {
        if (!backend) setData((d) => ({ ...d, credits: d.credits + n }));
      },
      addRedesign: (r) => setData((d) => ({ ...d, history: [r, ...d.history] })),
      deleteRedesign: (id) =>
        setData((d) => {
          const r = d.history.find((h) => h.id === id);
          if (r?.remoteId && userId) deleteRemoteRedesign(r.remoteId, userId).catch(() => {});
          if (r) {
            const stillUsed = d.history.some((h) => h.id !== id && h.beforeUri === r.beforeUri);
            if (!stillUsed) deleteImage(r.beforeUri);
            if (!r.mock) deleteImage(r.afterUri);
          }
          return { ...d, history: d.history.filter((h) => h.id !== id) };
        }),
      resetAll: () => {
        data.history.forEach((r) => {
          deleteImage(r.beforeUri);
          deleteImage(r.afterUri);
        });
        setData({ ...DEFAULTS });
        setDraft(EMPTY_DRAFT);
      },
    }),
    [data, credits, backend, hydrated, draft, updateDraft, resetDraft, spendCredits, refresh, userId],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
