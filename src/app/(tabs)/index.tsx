import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Carousel } from '@/components/carousel';
import { LogoHorizontal } from '@/components/logo';
import { StyleCard } from '@/components/style-card';
import { Button, CreditBadge, Screen, SectionHeader, Txt } from '@/components/ui';
import { getStyle, STYLES } from '@/config/styles';
import { imageSource } from '@/lib/image-source';
import { TAB_BAR_SPACE } from '@/components/pill-tab-bar';
import { useAppStore } from '@/store/app-store';
import { colors, radii, shadow, spacing } from '@/theme';

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return 'Good morning';
  if (h < 18) return 'Good afternoon';
  return 'Good evening';
}

export default function Home() {
  const { history, resetDraft } = useAppStore();

  const start = (styleId?: string) => {
    resetDraft(styleId ? { styleId, presetStyle: true } : undefined);
    router.push('/create/capture');
  };

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: TAB_BAR_SPACE }} showsVerticalScrollIndicator={false}>
        <View style={styles.brandRow}>
          <LogoHorizontal height={30} />
        </View>
        <View style={styles.top}>
          <View>
            <Txt variant="small">{greeting()},</Txt>
            <Txt variant="h1" style={{ marginTop: 2 }}>
              Let’s restyle
            </Txt>
          </View>
          <CreditBadge />
        </View>

        {/* Hero CTA */}
        <View style={[styles.hero, shadow.card]}>
          <View style={styles.heroRow}>
          <View style={styles.heroText}>
            <Txt variant="label" style={{ color: colors.accent }}>
              New redesign
            </Txt>
            <Txt variant="h2" style={{ marginTop: spacing.sm }}>
              Reimagine{'\n'}any room
            </Txt>
            <Txt variant="small" style={{ marginTop: spacing.sm }}>
              Snap a photo, pick a style, see it transformed.
            </Txt>
          </View>
          <View style={styles.heroArt}>
            <Image source={require('../../../assets/brand/hero-split.jpg')} style={{ width: '100%', height: '100%' }} contentFit="cover" contentPosition="center" />
          </View>
          </View>
          <Button title="Take a photo" icon="camera" onPress={() => start()} style={{ marginTop: spacing.xl }} />
        </View>

        {/* Your spaces */}
        {history.length > 0 && (
          <View style={styles.block}>
            <Carousel title="Your spaces" action="View all" onAction={() => router.push('/history')}>
              {history.slice(0, 8).map((r) => (
                <Pressable key={r.id} onPress={() => router.push(`/result/${r.id}`)} style={{ width: 150 }}>
                  <View style={styles.recentImg}>
                    <Image source={imageSource(r.afterUri)} style={StyleSheet.absoluteFill} contentFit="cover" />
                  </View>
                  <Txt variant="h3" style={{ fontSize: 17, marginTop: spacing.sm }} numberOfLines={1}>
                    {getStyle(r.styleId)?.name}
                  </Txt>
                  <Txt variant="small" numberOfLines={1}>
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Txt>
                </Pressable>
              ))}
            </Carousel>
          </View>
        )}

        {/* Curated styles */}
        <View style={styles.block}>
          <Carousel title="Explore styles">
            {STYLES.map((st) => (
              <StyleCard key={st.id} item={st} onPress={() => start(st.id)} style={{ width: 150 }} />
            ))}
          </Carousel>
        </View>

        {/* Tips */}
        <View style={[styles.pad, styles.block]}>
          <SectionHeader title="For best results" />
          <View style={styles.tipCard}>
            {[
              ['maximize', 'Stand in a corner to capture most of the room'],
              ['smartphone', 'Hold your phone horizontally'],
              ['sun', 'Use daylight and switch on the lights'],
            ].map(([icon, text]) => (
              <View key={text} style={styles.tip}>
                <Feather
                  name={icon as any}
                  size={16}
                  color={colors.accent}
                  // landscape phone for the "hold horizontally" tip
                  style={icon === 'smartphone' ? { transform: [{ rotate: '90deg' }] } : undefined}
                />
                <Txt variant="small" style={{ flex: 1, color: colors.text }}>
                  {text}
                </Txt>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brandRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, paddingHorizontal: spacing.xl, paddingTop: spacing.lg },
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  hero: {
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  heroRow: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  heroText: { flex: 1, paddingTop: 32 },
  heroArt: {
    width: '44%',
    aspectRatio: 0.7,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    borderBottomLeftRadius: radii.sm,
    borderBottomRightRadius: radii.sm,
    overflow: 'hidden',
  },
  block: { marginTop: spacing.xxl },
  pad: { paddingHorizontal: spacing.xl },
  hList: { paddingHorizontal: spacing.xl, gap: spacing.md },
  recentImg: { aspectRatio: 1, borderRadius: radii.md, overflow: 'hidden', backgroundColor: colors.sand },
  tipCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  tip: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
});
