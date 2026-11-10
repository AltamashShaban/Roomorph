/**
 * Google browser sign in returns to roomorph://auth-callback?code=…
 * On Android the app often receives that link directly (the browser result never reaches
 * the sign-in screen), so finish the sign in here, then go home.
 */
import { Redirect, useLocalSearchParams } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

import { finishBrowserSignIn } from '@/store/auth';

export default function AuthCallback() {
  const { code } = useLocalSearchParams<{ code?: string }>();
  const [done, setDone] = useState(!code);

  useEffect(() => {
    if (!code) return;
    finishBrowserSignIn(String(code))
      .catch((e) => console.warn('Google sign in couldn’t finish', e?.message ?? e))
      .finally(() => setDone(true));
  }, [code]);

  if (done) return <Redirect href="/" />;
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
      <ActivityIndicator />
    </View>
  );
}
