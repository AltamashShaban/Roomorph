/**
 * Prototype app state: credits, onboarding flag, the in-progress "draft"
 * redesign, and history. Persisted locally with AsyncStorage.
 * In production, credits + history move to Supabase.
 */
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';

import { FREE_CREDITS, type Quality } from '@/config/room-types';
import { deleteImage } from '@/lib/image';

export type Redesign = {
  id: string;
  beforeUri: string;
  afterUri: string;
  width: number;
  height: number;
  roomType: string;
  styleId: string;
  userPrompt?: string;
  quality: Quality;
  mock: boolean;
  createdAt: number;
};

export type Draft = {
  photoUri?: string;
  width?: number;
  height?: number;
  roomType?: string;
  styleId?: string;
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
  spendCredits: (n: number) => boolean;
  addCredits: (n: number) => void;
  addRedesign: (r: Redesign) => void;
  deleteRedesign: (id: string) => void;
  resetAll: () => void;
};

const KEY = 'roomorph:v1';
const EMPTY_DRAFT: Draft = { quality: 'standard' };
const DEFAULTS: Persisted = { onboarded: false, credits: FREE_CREDITS, history: [] };

const Ctx = createContext<Store | null>(null);

export function AppStoreProvider({ children }: { children: ReactNode }) {
  const [hydrated, setHydrated] = useState(false);
  const [data, setData] = useState<Persisted>(DEFAULTS);
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);

  useEffect(() => {
    AsyncStorage.getItem(KEY)
      .then((raw) => raw && setData({ ...DEFAULTS, ...JSON.parse(raw) }))
      .catch(() => {})
      .finally(() => setHydrated(true));
  }, []);

  useEffect(() => {
    if (hydrated) AsyncStorage.setItem(KEY, JSON.stringify(data)).catch(() => {});
  }, [data, hydrated]);

  const updateDraft = useCallback((patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch })), []);
  const resetDraft = useCallback((keep?: Partial<Draft>) => setDraft({ ...EMPTY_DRAFT, ...keep }), []);

  const spendCredits = useCallback(
    (n: number) => {
      if (data.credits < n) return false;
      setData((d) => ({ ...d, credits: d.credits - n }));
      return true;
    },
    [data.credits],
  );

  const value = useMemo<Store>(
    () => ({
      ...data,
      hydrated,
      draft,
      updateDraft,
      resetDraft,
      completeOnboarding: () => setData((d) => ({ ...d, onboarded: true })),
      resetOnboarding: () => setData((d) => ({ ...d, onboarded: false })),
      spendCredits,
      addCredits: (n) => setData((d) => ({ ...d, credits: d.credits + n })),
      addRedesign: (r) => setData((d) => ({ ...d, history: [r, ...d.history] })),
      deleteRedesign: (id) =>
        setData((d) => {
          const r = d.history.find((h) => h.id === id);
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
    [data, hydrated, draft, updateDraft, resetDraft, spendCredits],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAppStore must be used inside AppStoreProvider');
  return ctx;
}

export const newId = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
