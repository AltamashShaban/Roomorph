/**
 * Shop this look — the new furniture from a redesign, with estimated prices
 * and store searches for similar items. Tapping a store opens the phone's
 * browser (a new tab on web); ordering happens on the store's own site.
 */
import { Feather } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { showAlert } from '@/components/dialog';
import { ItemCrop } from '@/components/shop-hotspots';
import { Header, Screen, Txt } from '@/components/ui';
import { formatPrice, getShopItems, priceRange, STORES, type ShopItem } from '@/config/shop';
import { getStyle } from '@/config/styles';
import { imageSource } from '@/lib/image-source';
import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

export default function Shop() {
  const { id, item: focusId } = useLocalSearchParams<{ id: string; item?: string }>();
  const { history } = useAppStore();
  const r = history.find((h) => h.id === id);
  const scroller = useRef<ScrollView>(null);
  const [scrolled, setScrolled] = useState(false);

  if (!r) {
    return (
      <Screen>
        <Header showCredits={false} />
        <View style={{ padding: spacing.xl }}>
          <Txt variant="h2">Redesign not found</Txt>
        </View>
      </Screen>
    );
  }

  const style = getStyle(r.styleId);
  const items = getShopItems(r.styleId);
  // Pins/crops line up with the sample image (square). Live AI results get
  // real positions from the detection step in the full build.
  const canCrop = r.mock;
  const total = items.reduce((a, it) => [a[0] + it.priceMin, a[1] + it.priceMax], [0, 0]);

  const open = async (store: (typeof STORES)[number], it: ShopItem) => {
    const url = store.url(it.query);
    try {
      await Linking.openURL(url);
    } catch {
      showAlert('Couldn’t open the store', 'Please try again, or search for it in your browser.');
    }
  };

  return (
    <Screen>
      <Header title="Shop this look" showCredits={false} />
      <ScrollView ref={scroller} contentContainerStyle={styles.body}>
        <Txt variant="label" style={{ color: colors.accent }}>
          {style?.name} redesign
        </Txt>
        <Txt variant="h1" style={{ marginTop: spacing.xs }}>
          {items.length} pieces in this look
        </Txt>
        <Txt variant="small" style={{ marginTop: spacing.sm }}>
          Estimated total {formatPrice(total[0])}–{formatPrice(total[1])}. Tap a store to see similar items and order
          there.
        </Txt>

        <View style={styles.list}>
          {items.map((it) => {
            const focused = it.id === focusId;
            return (
              <View
                key={it.id}
                style={[styles.card, focused && styles.cardFocused]}
                onLayout={(e) => {
                  if (focused && !scrolled) {
                    setScrolled(true);
                    const y = e.nativeEvent.layout.y;
                    setTimeout(() => scroller.current?.scrollTo({ y: Math.max(0, y - spacing.lg), animated: true }), 150);
                  }
                }}>
                <View style={styles.cardTop}>
                  {canCrop ? (
                    <ItemCrop source={imageSource(r.afterUri)} x={it.x} y={it.y} imageAspect={1} />
                  ) : (
                    <View style={styles.cropFallback}>
                      <Feather name="shopping-bag" size={22} color={colors.muted} />
                    </View>
                  )}
                  <View style={{ flex: 1 }}>
                    <Txt variant="label" style={{ color: colors.muted, fontSize: 10 }}>
                      {it.category}
                    </Txt>
                    <Txt variant="h3" style={{ marginTop: 2 }}>
                      {it.name}
                    </Txt>
                    <Txt variant="body" style={{ marginTop: 4 }}>
                      Est. {priceRange(it)}
                    </Txt>
                  </View>
                </View>
                <View style={styles.stores}>
                  {STORES.map((s) => (
                    <Pressable
                      key={s.id}
                      onPress={() => open(s, it)}
                      accessibilityRole="link"
                      accessibilityLabel={`Find ${it.name} on ${s.name}`}
                      style={({ pressed }) => [styles.store, pressed && { backgroundColor: colors.sand }]}>
                      <Txt variant="small" style={{ color: colors.text, fontSize: 12 }}>
                        {s.name}
                      </Txt>
                      <Feather name="arrow-up-right" size={12} color={colors.muted} />
                    </Pressable>
                  ))}
                </View>
              </View>
            );
          })}
        </View>

        <View style={styles.note}>
          <Feather name="info" size={14} color={colors.muted} />
          <Txt variant="small" style={{ flex: 1, fontSize: 12 }}>
            Prices are estimates for similar items. Stores open in your browser — Roomorph doesn’t sell or ship
            anything.
          </Txt>
        </View>

        <Pressable onPress={() => router.back()} style={styles.back}>
          <Txt variant="label">Back to my redesign</Txt>
        </Pressable>
      </ScrollView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xxxl },
  list: { gap: spacing.md, marginTop: spacing.xl },
  card: {
    backgroundColor: colors.surface,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    gap: spacing.md,
  },
  cardFocused: { borderColor: colors.accent, borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', gap: spacing.md, alignItems: 'center' },
  cropFallback: {
    width: 84,
    height: 84,
    borderRadius: radii.sm,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stores: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  store: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 32,
    borderRadius: radii.pill,
    backgroundColor: colors.surfaceAlt,
  },
  note: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl, alignItems: 'flex-start' },
  back: { alignItems: 'center', paddingVertical: spacing.xl },
});
