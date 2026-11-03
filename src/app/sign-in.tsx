/**
 * Sign in (backend mode). Shown after onboarding when there's no session.
 * Apple (iOS) or Google. Email codes stay off until custom email sending is set up.
 * Long-pressing the wordmark shows an email + password form. It exists only for the
 * Google Play review account (store reviewers can't use their own Google accounts).
 */
import { AntDesign } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, TextInput, View } from 'react-native';
import { Pressable } from '@/components/pressable';

import { showAlert } from '@/components/dialog';
import { Wordmark } from '@/components/logo';
import { Ornament, Screen, Txt } from '@/components/ui';
import { AuthCancelled, useAuth } from '@/store/auth';
import { colors, radii, spacing, type } from '@/theme';

const ART = require('../../assets/brand/living.jpg');

export default function SignIn() {
  const auth = useAuth();
  const [busy, setBusy] = useState<string | null>(null);
  const [reviewer, setReviewer] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

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
        <Pressable onLongPress={() => setReviewer((v) => !v)} delayLongPress={800} accessibilityLabel="Roomsera">
          <Wordmark width={150} />
        </Pressable>
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
        {reviewer && (
          <View style={{ gap: spacing.sm }}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="Email"
              placeholderTextColor={colors.muted}
              autoCapitalize="none"
              autoCorrect={false}
              keyboardType="email-address"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={colors.muted}
              secureTextEntry
              style={styles.input}
            />
            <Pressable
              onPress={() => attempt('password', () => auth.signInWithPassword(email, password), done)}
              disabled={!!busy || !email || !password}
              style={({ pressed }) => [styles.google, (pressed || busy === 'password') && { opacity: 0.7 }]}>
              <Txt style={[type.button, { color: colors.text }]}>{busy === 'password' ? 'Signing in…' : 'Sign in'}</Txt>
            </Pressable>
          </View>
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
  input: {
    height: 50,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    paddingHorizontal: spacing.md,
    color: colors.text,
  },
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
