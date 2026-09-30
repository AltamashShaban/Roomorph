import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { RoomIllustration, WARM } from '@/components/room-illustration';
import { StyleCard } from '@/components/style-card';
import { Button, CreditBadge, Screen, SectionHeader, Txt } from '@/components/ui';
import { getRoomType } from '@/config/room-types';
import { FEATURED_STYLE_IDS, getStyle, STYLES } from '@/config/styles';
import { isLiveAI } from '@/lib/generate';
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
  const featured = FEATURED_STYLE_IDS.map((id) => getStyle(id)!).filter(Boolean);

  const start = (styleId?: string) => {
    resetDraft(styleId ? { styleId } : undefined);
    router.push('/create/capture');
  };

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={{ paddingBottom: spacing.xxxl }} showsVerticalScrollIndicator={false}>
        <View style={styles.top}>
          <View>
            <Txt variant="small">{greeting()},</Txt>
            <Txt variant="h1" style={{ marginTop: 2 }}>
              Let’s restyle
            </Txt>
          </View>
          <CreditBadge />
        </View>

        {!isLiveAI() && (
          <View style={styles.mockBanner}>
            <Feather name="info" size={13} color={colors.accent} />
            <Txt variant="small" style={{ flex: 1, fontSize: 12 }}>
              Prototype · mock mode. Add an OpenAI key to generate real redesigns.
            </Txt>
          </View>
        )}

        {/* Hero CTA */}
        <View style={[styles.hero, shadow.card]}>
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
            <RoomIllustration palette={WARM} compact />
          </View>
          <Button title="Take a photo" icon="camera" onPress={() => start()} style={{ marginTop: spacing.lg }} />
        </View>

        {/* Your spaces */}
        {history.length > 0 && (
          <View style={styles.block}>
            <View style={styles.pad}>
              <SectionHeader title="Your spaces" action="View all" onAction={() => router.push('/history')} />
            </View>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
              {history.slice(0, 8).map((r) => (
                <Pressable key={r.id} onPress={() => router.push(`/result/${r.id}`)} style={{ width: 150 }}>
                  <View style={styles.recentImg}>
                    <Image source={{ uri: r.afterUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                    {r.mock && (
                      <View style={[StyleSheet.absoluteFill, { backgroundColor: getStyle(r.styleId)?.palette[1], opacity: 0.35 }]} />
                    )}
                  </View>
                  <Txt variant="h3" style={{ fontSize: 17, marginTop: spacing.sm }} numberOfLines={1}>
                    {getRoomType(r.roomType)?.name}
                  </Txt>
                  <Txt variant="small" numberOfLines={1}>
                    {getStyle(r.styleId)?.name}
                  </Txt>
                </Pressable>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Curated styles */}
        <View style={styles.block}>
          <View style={styles.pad}>
            <SectionHeader title="Curated for you" action={`All ${STYLES.length}`} onAction={() => start()} />
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.hList}>
            {featured.map((st) => (
              <StyleCard key={st.id} item={st} onPress={() => start(st.id)} style={{ width: 150 }} />
            ))}
          </ScrollView>
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
                <Feather name={icon as any} size={16} color={colors.accent} />
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
  top: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.lg,
    paddingBottom: spacing.lg,
  },
  mockBanner: {
    flexDirection: 'row',
    gap: spacing.sm,
    alignItems: 'center',
    marginHorizontal: spacing.xl,
    marginBottom: spacing.lg,
    padding: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
  },
  hero: {
    marginHorizontal: spacing.xl,
    padding: spacing.xl,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  heroText: { width: '58%', minHeight: 190 },
  heroArt: {
    position: 'absolute',
    right: -10,
    top: spacing.xl,
    width: '42%',
    aspectRatio: 0.8,
    borderTopLeftRadius: 999,
    borderTopRightRadius: 999,
    overflow: 'hidden',
  },
  block: { marginTop: spacing.xxl },
  pad: { paddingHorizontal: spacing.xl },
  hList: { paddingHorizontal: spacing.xl, gap: spacing.md },
  recentImg: { aspectRatio: 1, borderRadius: radii.md, overflow: 'hidden', backgroundColor: colors.sand },
  tipCard: { backgroundColor: colors.surface, borderRadius: radii.md, padding: spacing.lg, gap: spacing.md, borderWidth: 1, borderColor: colors.border },
  tip: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
});
