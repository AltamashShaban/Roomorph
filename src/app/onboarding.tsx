import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, useWindowDimensions, View } from 'react-native';

import { BeforeAfterSlider } from '@/components/before-after-slider';
import { DRAB, RoomIllustration, WARM } from '@/components/room-illustration';
import { Button, Ornament, Screen, Txt } from '@/components/ui';
import { STYLES } from '@/config/styles';
import { useAppStore } from '@/store/app-store';
import { colors, fonts, radii, spacing } from '@/theme';

const PAGES = 3;

export default function Onboarding() {
  const { width } = useWindowDimensions();
  const scroller = useRef<ScrollView>(null);
  const [page, setPage] = useState(0);
  const [pageH, setPageH] = useState(0);
  const { completeOnboarding } = useAppStore();

  const goTo = (i: number) => {
    setPage(i);
    scroller.current?.scrollTo({ x: i * width, animated: true });
  };

  const finish = (startCapture: boolean) => {
    completeOnboarding();
    router.replace('/');
    if (startCapture) setTimeout(() => router.push('/create/capture'), 50);
  };

  return (
    <Screen style={{ backgroundColor: page === 0 ? colors.surfaceAlt : colors.background }}>
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
        onLayout={(e) => setPageH(e.nativeEvent.layout.height)}
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => {
          const i = Math.round(e.nativeEvent.contentOffset.x / width);
          if (i !== page) setPage(i);
        }}>
        {/* 1 — Brand */}
        <View style={[styles.page, { width, height: pageH }]}>
          <View style={styles.center}>
            <Txt style={styles.monogram}>rm</Txt>
            <Txt variant="display" style={{ fontSize: 60, lineHeight: 62, textAlign: 'center' }}>
              roomorph
            </Txt>
            <Ornament />
            <Txt variant="label" style={{ color: colors.muted, textAlign: 'center', lineHeight: 20 }}>
              Your room,{'\n'}beautifully reimagined
            </Txt>
          </View>
          <View style={styles.heroArt}>
            <RoomIllustration palette={WARM} />
          </View>
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
            before={<RoomIllustration palette={DRAB} />}
            after={<RoomIllustration palette={WARM} />}
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
            { icon: 'layers', title: 'Choose a style', text: `${STYLES.length} styles — Japandi to Mughal, Coastal to Art Deco.` },
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
        <Pressable onPress={() => finish(false)} style={{ alignItems: 'center', paddingVertical: spacing.md }}>
          <Txt variant="label" style={{ color: page === PAGES - 1 ? colors.text : 'transparent' }}>
            Explore first
          </Txt>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { height: 44, paddingHorizontal: spacing.xl, alignItems: 'flex-end', justifyContent: 'center' },
  page: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  center: { alignItems: 'center', marginTop: spacing.xxl },
  monogram: { fontFamily: fonts.serifItalic, fontSize: 26, color: colors.taupe, marginBottom: spacing.lg },
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
  footer: { paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  dots: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginBottom: spacing.lg },
  dot: { width: 6, height: 6, borderRadius: 3, backgroundColor: colors.taupe, opacity: 0.4 },
  dotActive: { width: 18, opacity: 1, backgroundColor: colors.ink },
});
