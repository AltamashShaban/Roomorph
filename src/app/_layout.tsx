import {
  PlayfairDisplay_400Regular,
  PlayfairDisplay_400Regular_Italic,
  PlayfairDisplay_500Medium,
} from '@expo-google-fonts/playfair-display';
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold } from '@expo-google-fonts/inter';
import { useFonts } from 'expo-font';
import { Stack, router, usePathname } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import { DialogHost } from '@/components/dialog';
import { AppStoreProvider, useAppStore } from '@/store/app-store';
import { AuthProvider, useAuth } from '@/store/auth';
import { colors } from '@/theme';

SplashScreen.preventAutoHideAsync();

/**
 * Web prototype (shared link): every page load is a fresh start.
 * Clear saved progress before the store loads it, so each visitor
 * begins at onboarding with the default free credits and no history.
 * The phone app keeps saving progress as normal.
 */
const FRESH_START_ON_WEB = true;
if (Platform.OS === 'web' && FRESH_START_ON_WEB) {
  try {
    Object.keys(window.localStorage)
      .filter((k) => k.startsWith('roomorph:'))
      .forEach((k) => window.localStorage.removeItem(k));
  } catch {
    // storage blocked (private mode etc.) — nothing saved to clear
  }
}

function RootNavigator() {
  const { hydrated, onboarded } = useAppStore();
  const auth = useAuth();
  const [fontsLoaded] = useFonts({
    PlayfairDisplay_400Regular,
    PlayfairDisplay_400Regular_Italic,
    PlayfairDisplay_500Medium,
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
  });

  const ready = hydrated && fontsLoaded && auth.ready;
  useEffect(() => {
    if (ready) SplashScreen.hideAsync();
  }, [ready]);

  // Web: whatever URL someone opens (e.g. a copied /result/... link), start at onboarding.
  const pathname = usePathname();
  const redirected = useRef(false);
  useEffect(() => {
    if (!ready || redirected.current || Platform.OS !== 'web' || !FRESH_START_ON_WEB) return;
    redirected.current = true;
    if (pathname !== '/onboarding') router.replace('/onboarding');
  }, [ready, pathname]);

  // Backend: after onboarding, nothing works without an account (credits live on the server).
  const needsSignIn = auth.enabled && !auth.session && onboarded;
  useEffect(() => {
    if (!ready || !needsSignIn) return;
    if (pathname !== '/sign-in' && pathname !== '/onboarding' && pathname !== '/auth-callback') router.replace('/sign-in');
  }, [ready, needsSignIn, pathname]);

  if (!ready) return null;

  return (
    <>
    <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding" options={{ animation: 'fade' }} />
      <Stack.Screen name="sign-in" options={{ animation: 'fade', gestureEnabled: false }} />
      <Stack.Screen name="create/generating" options={{ gestureEnabled: false, animation: 'fade' }} />
      <Stack.Screen name="paywall" options={{ presentation: 'modal' }} />
    </Stack>
    <DialogHost />
    </>
  );
}

export default function RootLayout() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthProvider>
          <AppStoreProvider>
            <StatusBar style="dark" />
            <RootNavigator />
          </AppStoreProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
