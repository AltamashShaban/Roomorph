/**
 * Generating screen. The animation here is a PLACEHOLDER — swap in your own
 * (e.g. Lottie/Rive) later. It's built to feel OK for a 20–60s wait:
 * blurred photo, rotating status lines, and a progress bar that eases
 * toward ~90% and completes when the result arrives.
 */
import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';

import { Button, Screen, Txt } from '@/components/ui';
import { QUALITY } from '@/config/room-types';
import { getStyle } from '@/config/styles';
import { generateRedesign, GenerationError, isLiveAI } from '@/lib/generate';
import { persistImage } from '@/lib/image';
import { sanitizeUserPrompt } from '@/lib/prompt';
import { newId, useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

const MESSAGES = [
  'Studying your room…',
  'Measuring the light…',
  'Choosing materials…',
  'Arranging furniture…',
  'Styling the details…',
  'Adding the finishing touches…',
];

export default function Generating() {
  const { draft, spendCredits, addCredits, addRedesign } = useAppStore();
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState(0);
  const started = useRef(false);
  const abort = useRef<AbortController | null>(null);
  const progress = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;

  const cost = QUALITY[draft.quality].credits;
  const style = getStyle(draft.styleId);
  const expectedMs = isLiveAI() ? (draft.quality === 'hd' ? 60000 : 35000) : 4500;

  const run = async () => {
    setError(null);
    if (!draft.photoUri || !draft.roomType || !draft.styleId || !draft.width || !draft.height) {
      setError('Something is missing — please start again.');
      return;
    }
    if (!spendCredits(cost)) {
      router.replace('/paywall');
      return;
    }

    progress.setValue(0);
    Animated.timing(progress, { toValue: 0.9, duration: expectedMs, easing: Easing.out(Easing.cubic), useNativeDriver: false }).start();

    const id = newId();
    abort.current = new AbortController();
    try {
      const beforeUri = draft.photoUri.includes('/redesigns/') ? draft.photoUri : persistImage(draft.photoUri, `${id}-before.jpg`);
      const out = await generateRedesign({
        id,
        photoUri: beforeUri,
        width: draft.width,
        height: draft.height,
        roomType: draft.roomType,
        styleId: draft.styleId,
        userPrompt: sanitizeUserPrompt(draft.userPrompt),
        quality: draft.quality,
        signal: abort.current.signal,
      });
      addRedesign({
        id,
        beforeUri,
        afterUri: out.afterUri,
        width: draft.width,
        height: draft.height,
        roomType: draft.roomType,
        styleId: draft.styleId,
        userPrompt: sanitizeUserPrompt(draft.userPrompt) || undefined,
        quality: draft.quality,
        mock: out.mock,
        createdAt: Date.now(),
      });
      Animated.timing(progress, { toValue: 1, duration: 300, useNativeDriver: false }).start(() =>
        router.replace(`/result/${id}`),
      );
    } catch (e) {
      addCredits(cost); // automatic refund
      progress.stopAnimation();
      if (e instanceof GenerationError && e.message === 'Cancelled') return;
      setError(e instanceof Error ? e.message : 'Something went wrong.');
    }
  };

  useEffect(() => {
    if (started.current) return;
    started.current = true;
    run();
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ]),
    );
    loop.start();
    const t = setInterval(() => setMsg((m) => (m + 1) % MESSAGES.length), 3200);
    return () => {
      loop.stop();
      clearInterval(t);
      abort.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const cancel = () => {
    abort.current?.abort();
    router.back();
  };

  const width = progress.interpolate({ inputRange: [0, 1], outputRange: ['0%', '100%'] });
  const scale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.04] });

  return (
    <Screen>
      <View style={styles.body}>
        <Animated.View style={[styles.photo, { transform: [{ scale }] }]}>
          {draft.photoUri && <Image source={{ uri: draft.photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" blurRadius={error ? 0 : 18} />}
          {!error && <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(246,242,236,0.35)' }]} />}
        </Animated.View>

        {error ? (
          <View style={styles.text}>
            <Feather name="alert-circle" size={22} color={colors.danger} />
            <Txt variant="h2" style={{ marginTop: spacing.md, textAlign: 'center' }}>
              That didn’t work
            </Txt>
            <Txt variant="small" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
              {error}
            </Txt>
            <Txt variant="label" style={{ marginTop: spacing.md, color: colors.success }}>
              Your {cost} {cost === 1 ? 'credit was' : 'credits were'} refunded
            </Txt>
          </View>
        ) : (
          <View style={styles.text}>
            <Txt variant="label" style={{ color: colors.accent }}>
              {style?.name}
            </Txt>
            <Txt variant="h2" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
              {MESSAGES[msg]}
            </Txt>
            <View style={styles.track}>
              <Animated.View style={[styles.bar, { width }]} />
            </View>
            <Txt variant="small" style={{ marginTop: spacing.md, textAlign: 'center' }}>
              {isLiveAI() ? 'This usually takes 20–60 seconds.' : 'Mock mode — a few seconds.'}
            </Txt>
          </View>
        )}
      </View>

      <View style={styles.footer}>
        {error ? (
          <>
            <Button title="Try again" icon="refresh-cw" onPress={run} />
            <Button title="Go back" variant="secondary" onPress={() => router.back()} />
          </>
        ) : (
          <Button title="Cancel" variant="ghost" onPress={cancel} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xl },
  photo: {
    width: '78%',
    aspectRatio: 3 / 4,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: radii.md,
    borderBottomRightRadius: radii.md,
    overflow: 'hidden',
    backgroundColor: colors.sand,
  },
  text: { alignItems: 'center', marginTop: spacing.xxl, width: '100%' },
  track: { width: '70%', height: 2, backgroundColor: colors.border, marginTop: spacing.xl, overflow: 'hidden' },
  bar: { height: 2, backgroundColor: colors.ink },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: spacing.md },
});
