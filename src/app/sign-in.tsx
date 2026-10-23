/**
 * Sign in (backend mode). Shown after onboarding when there's no session.
 * Apple (iOS), Google, or a 6-digit code sent by email.
 */
import { AntDesign } from '@expo/vector-icons';
import * as AppleAuthentication from 'expo-apple-authentication';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, StyleSheet, TextInput, View } from 'react-native';

import { showAlert } from '@/components/dialog';
import { Wordmark } from '@/components/logo';
import { Button, Ornament, Screen, Txt } from '@/components/ui';
import { AuthCancelled, useAuth } from '@/store/auth';
import { colors, fonts, radii, spacing, type } from '@/theme';

const ART = require('../../assets/brand/living.jpg');

type Step = 'choose' | 'email' | 'code';

export default function SignIn() {
  const auth = useAuth();
  const [step, setStep] = useState<Step>('choose');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
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
  const validEmail = /^\S+@\S+\.\S+$/.test(email.trim());

  return (
    <Screen>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.body}>
          <Wordmark width={150} />
          {step === 'choose' && (
            <View style={styles.art}>
              <Image source={ART} style={{ flex: 1 }} contentFit="cover" />
            </View>
          )}

          {step === 'choose' && (
            <>
              <Txt variant="h1" style={styles.center}>
                Save every room
              </Txt>
              <Ornament />
              <Txt variant="small" style={styles.center}>
                Sign in to get your free credits and keep your redesigns on every device.
              </Txt>
            </>
          )}

          {step === 'email' && (
            <View style={styles.form}>
              <Txt variant="h2">What’s your email?</Txt>
              <Txt variant="small" style={{ marginTop: spacing.sm }}>
                We’ll send you a 6-digit code. No password needed.
              </Txt>
              <TextInput
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                placeholderTextColor={colors.taupe}
                autoCapitalize="none"
                autoComplete="email"
                keyboardType="email-address"
                textContentType="emailAddress"
                autoFocus
                style={styles.input}
              />
            </View>
          )}

          {step === 'code' && (
            <View style={styles.form}>
              <Txt variant="h2">Check your inbox</Txt>
              <Txt variant="small" style={{ marginTop: spacing.sm }}>
                Enter the 6-digit code we sent to {email.trim()}.
              </Txt>
              <TextInput
                value={code}
                onChangeText={(t) => setCode(t.replace(/\D/g, '').slice(0, 6))}
                placeholder="123456"
                placeholderTextColor={colors.taupe}
                keyboardType="number-pad"
                textContentType="oneTimeCode"
                autoComplete="one-time-code"
                autoFocus
                style={[styles.input, styles.code]}
              />
            </View>
          )}
        </View>

        <View style={styles.footer}>
          {step === 'choose' && (
            <>
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
              <Button title="Continue with email" variant="ghost" icon="mail" onPress={() => setStep('email')} />
            </>
          )}

          {step === 'email' && (
            <>
              <Button
                title="Send code"
                disabled={!validEmail}
                loading={busy === 'send'}
                onPress={() => attempt('send', () => auth.sendEmailCode(email), () => setStep('code'))}
              />
              <Button title="Back" variant="ghost" onPress={() => setStep('choose')} />
            </>
          )}

          {step === 'code' && (
            <>
              <Button
                title="Sign in"
                disabled={code.length !== 6}
                loading={busy === 'verify'}
                onPress={() => attempt('verify', () => auth.verifyEmailCode(email, code), done)}
              />
              <Button
                title="Send a new code"
                variant="ghost"
                disabled={!!busy}
                onPress={() => attempt('send', () => auth.sendEmailCode(email), () => setCode(''))}
              />
            </>
          )}

          <Txt variant="small" style={[styles.center, { fontSize: 11, marginTop: spacing.sm }]}>
            By continuing you agree to our Terms and Privacy Policy.
          </Txt>
        </View>
      </KeyboardAvoidingView>
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
  form: { alignSelf: 'stretch', marginTop: spacing.xxl },
  input: {
    ...type.body,
    fontFamily: fonts.sans,
    marginTop: spacing.xl,
    height: 54,
    paddingHorizontal: spacing.lg,
    borderRadius: radii.sm,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  code: { fontSize: 24, letterSpacing: 8, textAlign: 'center' },
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
