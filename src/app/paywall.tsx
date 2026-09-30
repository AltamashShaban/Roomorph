/**
 * Paywall (mock). In the full build, packs come from RevenueCat and credits
 * are granted server-side by a webhook — never by the app.
 */
import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useState } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { showAlert } from '@/components/dialog';

import { Image } from 'expo-image';

import { Button, Ornament, Screen, Txt } from '@/components/ui';
import { CREDIT_PACKS, QUALITY } from '@/config/options';
import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

export default function Paywall() {
  const { credits, addCredits } = useAppStore();
  const [selected, setSelected] = useState(CREDIT_PACKS.find((p) => p.highlight)?.id ?? CREDIT_PACKS[0].id);
  const pack = CREDIT_PACKS.find((p) => p.id === selected)!;

  const buy = () => {
    addCredits(pack.credits);
    showAlert('Mock purchase', `${pack.credits} credits added. (No real payment in the prototype.)`, [
      { text: 'OK', onPress: () => router.back() },
    ]);
  };

  return (
    <Screen>
      <View style={styles.close}>
        <Pressable onPress={() => router.back()} hitSlop={12} accessibilityLabel="Close">
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.art}>
          <Image source={require('../../assets/brand/dining.jpg')} style={{ width: '100%', height: '100%' }} contentFit="cover" />
        </View>
        <Txt variant="h1" style={{ textAlign: 'center', marginTop: spacing.xl }}>
          {credits === 0 ? 'You’re out of credits' : 'More rooms,\nmore ideas'}
        </Txt>
        <Ornament />
        <Txt variant="small" style={{ textAlign: 'center' }}>
          Standard = {QUALITY.standard.credits} credit · HD = {QUALITY.hd.credits} credits.{'\n'}Credits never expire.
        </Txt>

        <View style={styles.packs}>
          {CREDIT_PACKS.map((p) => {
            const active = p.id === selected;
            return (
              <Pressable key={p.id} onPress={() => setSelected(p.id)} style={[styles.pack, active && styles.packActive]}>
                {p.highlight && (
                  <View style={styles.badge}>
                    <Txt variant="label" style={{ fontSize: 8, color: colors.onInk }}>
                      Best value
                    </Txt>
                  </View>
                )}
                <Txt variant="h1" style={{ color: active ? colors.onInk : colors.text }}>
                  {p.credits}
                </Txt>
                <Txt variant="label" style={{ fontSize: 9, color: active ? colors.sand : colors.muted }}>
                  credits
                </Txt>
                <Txt variant="body" style={{ marginTop: spacing.sm, color: active ? colors.onInk : colors.text }}>
                  {p.price}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={styles.footer}>
        <Button title={`Get ${pack.credits} credits · ${pack.price}`} onPress={buy} />
        <View style={styles.legal}>
          <Pressable onPress={() => showAlert('Restore purchases', 'Coming in the full build.')}>
            <Txt variant="small" style={{ fontSize: 12 }}>
              Restore purchases
            </Txt>
          </Pressable>
          <Txt variant="small" style={{ fontSize: 12 }}>
            ·
          </Txt>
          <Txt variant="small" style={{ fontSize: 12 }}>
            Terms · Privacy
          </Txt>
        </View>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  close: { height: 48, paddingHorizontal: spacing.xl, alignItems: 'flex-end', justifyContent: 'center' },
  body: { flex: 1, alignItems: 'center', paddingHorizontal: spacing.xl },
  art: { width: 140, aspectRatio: 0.8, borderTopLeftRadius: 999, borderTopRightRadius: 999, overflow: 'hidden' },
  packs: { flexDirection: 'row', gap: spacing.md, marginTop: spacing.xxl, alignSelf: 'stretch' },
  pack: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: spacing.xl,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  packActive: { backgroundColor: colors.ink, borderColor: colors.ink },
  badge: { position: 'absolute', top: -10, backgroundColor: colors.accent, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 999 },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
  legal: { flexDirection: 'row', justifyContent: 'center', gap: spacing.sm, marginTop: spacing.md },
});
