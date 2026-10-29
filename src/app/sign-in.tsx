/**
 * Sign in (backend mode). Shown after onboarding when there's no session.
 * Apple (iOS) or Google. Email codes stay off until custom email sending is set up.
 */
import { AntDesign } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { showAlert } from '@/components/dialog';
import { Wordmark } from '@/components/logo';
import { Ornament, Screen, Txt } from '@/components/ui';
import { AuthCancelled, useAuth } from '@/store/auth';
import { colors, radii, spacing, type } from '@/theme';

const ART = require('../../assets/brand/living.jpg');

export default function SignIn() {
  const auth = useAuth();
  const [busy, setBusy] = useState<string | null>(null);

  const attempt = async (key: string, fn: () => Promise<void>, onDone?: () => void) => {
    setBusy(key);
    try {
      await fn();
      onDone?.();
    } catch (e) {
      if (!(e instanceof AuthCancelled)) {
        showAlert('Couldn’t sign in', e instanceof Error ? e.message : 'Please try again.');
      }
    } finally {
      setBusy(null);
    }
  };

  const done = () => router.replace('/');

  return (
    <Screen>
      <View style={styles.body}>
        <Wordmark width={150} />
        <View style={styles.art}>
          <Image source={ART} style={{ flex: 1 }} contentFit="cover" />
        </View>
        <Txt variant="h1" style={styles.center}>
          Save every room
        </Txt>
        <Ornament />
        <Txt variant="small" style={styles.center}>
          Sign in to get your free credits and keep your redesigns on every device.
        </Txt>
      </View>

      <View style={styles.footer}>
        {auth.appleAvailable && (
          <AppleAuthentication.AppleAuthenticationButton
            buttonType={AppleAuthentication.AppleAuthenticationButtonType.CONTINUE}
            buttonStyle={AppleAuthentication.AppleAuthenticationButtonStyle.BLACK}
            cornerRadius={radii.sm}
            style={styles.apple}
            onPress={() => attempt('apple', auth.signInWithApple, done)}
          />
        )}
        <Pressable
          onPress={() => attempt('google', auth.signInWithGoogle, done)}
          disabled={!!busy}
          style={({ pressed }) => [styles.google, (pressed || busy === 'google') && { opacity: 0.7 }]}>
          <AntDesign name="google" size={16} color={colors.text} />
          <Txt style={[type.button, { color: colors.text }]}>{busy === 'google' ? 'Opening Google…' : 'Continue with Google'}</Txt>
        </Pressable>

        <Txt variant="small" style={[styles.center, { fontSize: 11, marginTop: spacing.sm }]}>
          By continuing you agree to our Terms and Privacy Policy.
        </Txt>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl, paddingTop: spacing.xxl },
  art: {
    flex: 1,
    alignSelf: 'stretch',
    marginHorizontal: spacing.xxl,
    marginTop: spacing.xl,
    marginBottom: spacing.xl,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    overflow: 'hidden',
  },
  center: { textAlign: 'center' },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: spacing.md },
  apple: { height: 54, width: '100%' },
  google: {
    height: 54,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
  },
});
