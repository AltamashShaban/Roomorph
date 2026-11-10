/**
 * Sign in (production backend only). Three ways in, all through Supabase Auth:
 *   • Email: a 6-digit code (works everywhere, including Expo Go)
 *   • Apple: native sheet on iOS (needs a development/store build)
 *   • Google: on Android the native Google account sheet (shows "Roomsera", not the
 *     Supabase address); elsewhere, or if the native client ID isn't set, browser sign-in
 * When the backend isn't configured, `enabled` is false and nothing here runs.
 */
import type { Session } from '@supabase/supabase-js';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Linking from 'expo-linking';
import * as WebBrowser from 'expo-web-browser';
import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Platform } from 'react-native';

import { supabase } from '@/lib/supabase';

WebBrowser.maybeCompleteAuthSession();

/** The Google Cloud *web* OAuth client ID (the one Supabase's Google provider uses). Public, not a secret. */
const GOOGLE_WEB_CLIENT_ID = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

/** So the next sign in asks which Google account to use instead of reusing the last one. */
async function forgetNativeGoogleAccount() {
  if (Platform.OS !== 'android' || !GOOGLE_WEB_CLIENT_ID) return;
  try {
    const { GoogleSignin } = await import('@react-native-google-signin/google-signin');
    await GoogleSignin.signOut();
  } catch {
    // best effort
  }
}

type Auth = {
  enabled: boolean;
  ready: boolean;
  session: Session | null;
  email?: string;
  sendEmailCode: (email: string) => Promise<void>;
  verifyEmailCode: (email: string, code: string) => Promise<void>;
  signInWithPassword: (email: string, password: string) => Promise<void>;
  appleAvailable: boolean;
  signInWithApple: () => Promise<void>;
  signInWithGoogle: () => Promise<void>;
  signOut: () => Promise<void>;
  deleteAccount: () => Promise<void>;
};

export class AuthCancelled extends Error {}

const Ctx = createContext<Auth | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(!supabase);
  const [appleAvailable, setAppleAvailable] = useState(false);

  useEffect(() => {
    if (!supabase) return;
    supabase.auth
      .getSession()
      .then(({ data }) => setSession(data.session))
      .finally(() => setReady(true));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (Platform.OS === 'ios') AppleAuthentication.isAvailableAsync().then(setAppleAvailable).catch(() => {});
  }, []);

  const value = useMemo<Auth>(() => {
    const client = () => {
      if (!supabase) throw new Error('Sign in is not set up in this build.');
      return supabase;
    };

    return {
      enabled: !!supabase,
      ready,
      session,
      email: session?.user.email,
      appleAvailable,

      sendEmailCode: async (email) => {
        const { error } = await client().auth.signInWithOtp({ email: email.trim().toLowerCase() });
        if (error) throw error;
      },

      verifyEmailCode: async (email, code) => {
        const { error } = await client().auth.verifyOtp({ email: email.trim().toLowerCase(), token: code.trim(), type: 'email' });
        if (error) throw error;
      },

      // Only for the Google Play review account, which is created by hand in Supabase.
      signInWithPassword: async (email, password) => {
        const { error } = await client().auth.signInWithPassword({ email: email.trim().toLowerCase(), password });
        if (error) throw error;
      },

      signInWithApple: async () => {
        try {
          const credential = await AppleAuthentication.signInAsync({
            requestedScopes: [AppleAuthentication.AppleAuthenticationScope.EMAIL],
          });
          if (!credential.identityToken) throw new Error('Apple didn’t return a sign-in token.');
          const { error } = await client().auth.signInWithIdToken({ provider: 'apple', token: credential.identityToken });
          if (error) throw error;
        } catch (e: any) {
          if (e?.code === 'ERR_REQUEST_CANCELED') throw new AuthCancelled();
          throw e;
        }
      },

      signInWithGoogle: async () => {
        if (Platform.OS === 'android' && GOOGLE_WEB_CLIENT_ID) {
          // Loaded lazily: the native module only exists in store/development builds.
          const { GoogleSignin, isErrorWithCode, statusCodes } = await import('@react-native-google-signin/google-signin');
          GoogleSignin.configure({ webClientId: GOOGLE_WEB_CLIENT_ID });
          try {
            await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });
            const res = await GoogleSignin.signIn();
            if (res.type !== 'success') throw new AuthCancelled();
            const idToken = res.data.idToken;
            if (!idToken) throw new Error('Google didn’t return a sign-in token. Please try again.');
            const { error } = await client().auth.signInWithIdToken({ provider: 'google', token: idToken });
            if (error) throw error;
            return;
          } catch (e: any) {
            if (e instanceof AuthCancelled) throw e;
            if (isErrorWithCode(e) && (e.code === statusCodes.SIGN_IN_CANCELLED || e.code === statusCodes.IN_PROGRESS)) throw new AuthCancelled();
            // Any other native problem (e.g. DEVELOPER_ERROR on some phones): fall back to the browser sign in below.
            console.warn('Native Google sign in failed, using the browser instead', e?.code ?? e?.message);
          }
        }

        const redirectTo = Linking.createURL('auth-callback');
        const { data, error } = await client().auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo, skipBrowserRedirect: true },
        });
        if (error || !data.url) throw error ?? new Error('Couldn’t start Google sign in.');

        const result = await WebBrowser.openAuthSessionAsync(data.url, redirectTo);
        if (result.type !== 'success') throw new AuthCancelled();

        const url = new globalThis.URL(result.url);
        const code = url.searchParams.get('code');
        if (!code) throw new Error(url.searchParams.get('error_description') ?? 'Google sign in didn’t finish.');
        const { error: exchangeError } = await client().auth.exchangeCodeForSession(code);
        if (exchangeError) throw exchangeError;
      },

      signOut: async () => {
        await client().auth.signOut();
        await forgetNativeGoogleAccount();
      },

      deleteAccount: async () => {
        const { error } = await client().functions.invoke('delete-account', { method: 'POST' });
        if (error) throw new Error('Your account couldn’t be deleted. Please try again.');
        await client().auth.signOut({ scope: 'local' });
        await forgetNativeGoogleAccount();
      },
    };
  }, [ready, session, appleAvailable]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useAuth() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
