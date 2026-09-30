import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { Asset, requestPermissionsAsync } from 'expo-media-library';
import { router, useLocalSearchParams } from 'expo-router';
import * as Sharing from 'expo-sharing';
import { useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { BeforeAfterSlider } from '@/components/before-after-slider';
import { Button, CreditBadge, Screen, Txt } from '@/components/ui';
import { getRoomType, QUALITY } from '@/config/room-types';
import { getStyle } from '@/config/styles';
import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

export default function Result() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { history, deleteRedesign, resetDraft } = useAppStore();
  const [saving, setSaving] = useState(false);
  const r = history.find((h) => h.id === id);

  if (!r) {
    return (
      <Screen>
        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl }}>
          <Txt variant="h2">Redesign not found</Txt>
          <Button title="Go home" onPress={() => router.dismissTo('/')} style={{ marginTop: spacing.xl, alignSelf: 'stretch' }} />
        </View>
      </Screen>
    );
  }

  const style = getStyle(r.styleId);
  const room = getRoomType(r.roomType);

  const save = async () => {
    setSaving(true);
    try {
      const perm = await requestPermissionsAsync(true);
      if (!perm.granted) {
        Alert.alert('Photos access needed', 'Allow access to save redesigns to your Photos.');
        return;
      }
      await Asset.create(r.afterUri);
      Alert.alert('Saved', 'Your redesign is in your Photos.');
    } catch {
      Alert.alert('Could not save', 'Saving to Photos may need a development build on Android. Try Share instead.');
    } finally {
      setSaving(false);
    }
  };

  const share = async () => {
    if (!(await Sharing.isAvailableAsync())) return Alert.alert('Sharing is not available on this device');
    await Sharing.shareAsync(r.afterUri, { mimeType: 'image/jpeg', dialogTitle: 'Share your redesign' });
  };

  const remove = () =>
    Alert.alert('Delete redesign?', 'This removes it from your history.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          router.dismissTo('/');
          setTimeout(() => deleteRedesign(r.id), 300);
        },
      },
    ]);

  const report = () =>
    Alert.alert('Report this image?', 'Let us know if this result is offensive or inappropriate.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Report', style: 'destructive', onPress: () => Alert.alert('Thanks', 'We’ll review it.') },
    ]);

  const regenerate = () => {
    resetDraft({
      photoUri: r.beforeUri,
      width: r.width,
      height: r.height,
      roomType: r.roomType,
      styleId: r.styleId,
      userPrompt: r.userPrompt,
      quality: r.quality,
    });
    router.push('/create/generating');
  };

  const anotherStyle = () => {
    resetDraft({ photoUri: r.beforeUri, width: r.width, height: r.height, roomType: r.roomType, quality: r.quality });
    router.push('/create/style');
  };

  const aspect = r.width / r.height;

  return (
    <Screen>
      <View style={styles.header}>
        <Pressable onPress={() => router.dismissTo('/')} hitSlop={10} style={styles.headerBtn}>
          <Feather name="x" size={22} color={colors.text} />
        </Pressable>
        <Txt variant="label">Your redesign</Txt>
        <View style={[styles.headerBtn, { alignItems: 'flex-end' }]}>
          <CreditBadge />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.body}>
        <BeforeAfterSlider
          aspectRatio={Math.max(0.75, Math.min(aspect, 1.6))}
          before={<Image source={{ uri: r.beforeUri }} style={StyleSheet.absoluteFill} contentFit="cover" />}
          after={
            <>
              <Image source={{ uri: r.afterUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
              {r.mock && (
                <>
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: style?.palette[1], opacity: 0.4 }]} />
                  <View style={styles.mockTag}>
                    <Txt variant="label" style={{ fontSize: 9, color: colors.onInk }}>
                      Mock preview
                    </Txt>
                  </View>
                </>
              )}
            </>
          }
        />

        <View style={styles.titleRow}>
          <View style={{ flex: 1 }}>
            <Txt variant="label" style={{ color: colors.accent }}>
              {room?.name} · {QUALITY[r.quality].label}
            </Txt>
            <Txt variant="h1" style={{ marginTop: spacing.xs }}>
              {style?.name}
            </Txt>
          </View>
          <View style={styles.iconRow}>
            <RoundIcon icon="download" label="Save" onPress={save} disabled={saving} />
            <RoundIcon icon="share" label="Share" onPress={share} />
          </View>
        </View>

        {r.userPrompt && (
          <Txt variant="small" style={{ marginTop: spacing.sm, fontStyle: 'italic' }}>
            “{r.userPrompt}”
          </Txt>
        )}

        <View style={styles.actions}>
          <Button title="Regenerate" icon="refresh-cw" onPress={regenerate} />
          <Button title="Try another style" variant="secondary" icon="layers" onPress={anotherStyle} />
        </View>

        <View style={styles.links}>
          <Pressable onPress={remove} hitSlop={8} style={styles.link}>
            <Feather name="trash-2" size={14} color={colors.muted} />
            <Txt variant="small">Delete</Txt>
          </Pressable>
          <Pressable onPress={report} hitSlop={8} style={styles.link}>
            <Feather name="flag" size={14} color={colors.muted} />
            <Txt variant="small">Report</Txt>
          </Pressable>
        </View>
      </ScrollView>
    </Screen>
  );
}

function RoundIcon({ icon, label, onPress, disabled }: { icon: any; label: string; onPress: () => void; disabled?: boolean }) {
  return (
    <Pressable onPress={onPress} disabled={disabled} style={({ pressed }) => [styles.round, (pressed || disabled) && { opacity: 0.6 }]} accessibilityLabel={label}>
      <Feather name={icon} size={18} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  header: { height: 52, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: spacing.lg },
  headerBtn: { width: 80 },
  body: { paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl },
  mockTag: { position: 'absolute', bottom: 12, right: 12, backgroundColor: colors.ink, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-end', marginTop: spacing.xl },
  iconRow: { flexDirection: 'row', gap: spacing.sm },
  round: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actions: { gap: spacing.md, marginTop: spacing.xl },
  links: { flexDirection: 'row', justifyContent: 'center', gap: spacing.xxl, marginTop: spacing.xl },
  link: { flexDirection: 'row', alignItems: 'center', gap: 6, padding: spacing.xs, borderRadius: radii.sm },
});
