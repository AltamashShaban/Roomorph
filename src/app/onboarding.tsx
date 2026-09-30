import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BeforeAfterSlider } from '@/components/before-after-slider';
import { Image } from 'expo-image';
import { Wordmark } from '@/components/logo';
import { Button, Screen, Txt } from '@/components/ui';
import { getStyle, SAMPLE_ROOM, STYLES } from '@/config/styles';
import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

const PAGES = 3;
const BRAND_LIVING = require('../../assets/brand/living.jpg');

export default function Onboarding() {
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  // Pages match the scroller's own size (not the window), so they fit any frame.
  const [{ width, height: pageH }, setSize] = useState({ width: 0, height: 0 });
  const { completeOnboarding } = useAppStore();

  const lock = useRef(0);
  const goTo = (i: number) => {
    lock.current = Date.now() + 700; // ignore scroll events from the programmatic scroll
    setPage(i);
    scroller.current?.scrollTo({ x: i * width, animated: true });
  };

  const finish = (startCapture: boolean) => {
    completeOnboarding();
    router.replace('/');
    if (startCapture) setTimeout(() => router.push('/create/capture'), 50);
  };

  return (
    <Screen style={{ backgroundColor: colors.background }}>
      <View style={styles.topBar}>
        {page < PAGES - 1 ? (
          <Pressable onPress={() => finish(false)} hitSlop={10}>
            <Txt variant="label" style={{ color: colors.muted }}>
              Skip
            </Txt>
          </Pressable>
        ) : (
          <View />
        )}
      </View>

      <ScrollView
        ref={scroller}
        horizontal
        pagingEnabled
        style={{ flex: 1 }}
        onLayout={(e) => setSize({ width: e.nativeEvent.layout.width, height: e.nativeEvent.layout.height })}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          if (Date.now() < lock.current) return;
          const i = width ? Math.round(e.nativeEvent.contentOffset.x / width) : 0;
          if (i !== page) setPage(i);
        }}>
        {/* 1 — Brand */}
        <View style={[styles.page, { width, height: pageH }]}>
          <View style={styles.center}>
            <Wordmark width={170} />
          </View>
          <View style={styles.heroArt}>
            <Image source={BRAND_LIVING} style={{ flex: 1 }} contentFit="cover" />
          </View>
          <Txt variant="small" style={{ textAlign: 'center', marginBottom: spacing.sm }}>
            Redesign any room in your home with AI.
          </Txt>
        </View>

        {/* 2 — Before / after demo */}
        <View style={[styles.page, { width, height: pageH }]}>
          <Txt variant="label" style={{ color: colors.accent }}>
            See it first
          </Txt>
          <Txt variant="h1" style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
            Same room.{'\n'}A whole new feel.
          </Txt>
          <BeforeAfterSlider
            aspectRatio={4 / 5}
            initial={0.55}
            before={<Image source={SAMPLE_ROOM} style={{ width: '100%', height: '100%' }} contentFit="cover" />}
            after={<Image source={getStyle('retro')!.image} style={{ width: '100%', height: '100%' }} contentFit="cover" />}
          />
          <View style={styles.hint}>
            <Feather name="move" size={14} color={colors.muted} />
            <Txt variant="small">Drag to compare</Txt>
          </View>
        </View>

        {/* 3 — How it works */}
        <View style={[styles.page, { width, height: pageH }]}>
          <Txt variant="label" style={{ color: colors.accent }}>
            How it works
          </Txt>
          <Txt variant="h1" style={{ marginTop: spacing.sm, marginBottom: spacing.xxl }}>
            Three steps to{'\n'}a new room
          </Txt>
          {[
            { icon: 'camera', title: 'Snap your space', text: 'Take a photo or pick one from your gallery.' },
            { icon: 'layers', title: 'Choose a style', text: `${STYLES.length} looks, from Japandi and Scandinavian to Retro and Gaming.` },
            { icon: 'star', title: 'See it transformed', text: 'Your room, redesigned in under a minute.' },
          ].map((step, i) => (
            <View key={step.title} style={styles.step}>
              <View style={styles.stepIcon}>
                <Feather name={step.icon as any} size={18} color={colors.text} />
              </View>
              <View style={{ flex: 1 }}>
                <Txt variant="label" style={{ color: colors.muted }}>
                  Step {i + 1}
                </Txt>
                <Txt variant="h3" style={{ marginTop: 2 }}>
                  {step.title}
                </Txt>
                <Txt variant="small" style={{ marginTop: 2 }}>
                  {step.text}
                </Txt>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>

      <View style={styles.footer}>
        <View style={styles.dots}>
          {Array.from({ length: PAGES }).map((_, i) => (
            <View key={i} style={[styles.dot, i === page && styles.dotActive]} />
          ))}
        </View>
        {page < PAGES - 1 ? (
          <Button title={page === 0 ? 'Get started' : 'Next'} onPress={() => goTo(page + 1)} />
        ) : (
          <Button title="Take a photo" icon="camera" onPress={() => finish(true)} />
        )}
        {page === PAGES - 1 ? (
          <Button title="Explore first" variant="secondary" onPress={() => finish(false)} />
        ) : (
          <View style={{ height: 54 }} />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { height: 44, paddingHorizontal: spacing.xl, alignItems: 'flex-end', justifyContent: 'center' },
  page: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  center: { alignItems: 'center', marginTop: spacing.xxl },
  heroArt: {
    flex: 1,
    marginTop: spacing.xxl,
    marginBottom: spacing.lg,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    overflow: 'hidden',
    marginHorizontal: spacing.xl,
  },
  hint: { flexDirection: 'row', alignItems: 'center', gap: 6, justifyContent: 'center', marginTop: spacing.md },
  step: { flexDirection: 'row', gap: spacing.lg, marginBottom: spacing.xl },
  stepIcon: {
    width: 44,
    height: 44,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.lg, gap: spacing.md },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: spacing.sm },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.taupe, opacity: 0.4 },
  dotActive: { width: 18, opacity: 1, backgroundColor: colors.ink },
});
