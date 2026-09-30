import { router } from 'expo-router';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { StyleCard, StyleThumb } from '@/components/style-card';
import { Button, Header, Screen, Txt } from '@/components/ui';
import { getStyle, STYLES, type InteriorStyle } from '@/config/styles';
import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

export default function StyleScreen() {
  const { draft, updateDraft } = useAppStore();
  const [preview, setPreview] = useState<InteriorStyle | null>(null);
  const insets = useSafeAreaInsets();

  const selected = getStyle(draft.styleId);

  const choose = (st: InteriorStyle) => {
    updateDraft({ styleId: st.id, presetStyle: false });
    setPreview(null);
  };

  return (
    <Screen>
      <Header step="Step 2 of 3" />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <Txt variant="h1">Pick a style</Txt>
        <Txt variant="small" style={{ marginTop: spacing.sm }}>
          Tap a style to see it up close.
        </Txt>
      </View>

      <View style={{ height: spacing.lg }} />

      <FlatList
        data={STYLES}
        numColumns={2}
        keyExtractor={(s) => s.id}
        columnWrapperStyle={{ gap: spacing.md }}
        contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xl, gap: spacing.lg }}
        renderItem={({ item }) => (
          <StyleCard item={item} selected={draft.styleId === item.id} onPress={() => setPreview(item)} style={{ flex: 1 / 2 }} />
        )}
      />

      <View style={styles.footer}>
        <Button
          title={selected ? `Continue with ${selected.name}` : 'Choose a style'}
          disabled={!selected}
          onPress={() => router.push('/create/details')}
        />
      </View>

      {/* Style detail sheet */}
      <Modal visible={!!preview} transparent animationType="slide" onRequestClose={() => setPreview(null)}>
        <Pressable style={styles.backdrop} onPress={() => setPreview(null)} />
        {preview && (
          <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.lg }]}>
            <View style={styles.grabber} />
            <StyleThumb style={preview} aspectRatio={4 / 3} />
            <Txt variant="label" style={{ color: colors.accent, marginTop: spacing.lg }}>
              Style
            </Txt>
            <Txt variant="h1" style={{ marginTop: spacing.xs }}>
              {preview.name}
            </Txt>
            <Txt variant="body" style={{ marginTop: spacing.sm, color: colors.muted }}>
              {preview.description}
            </Txt>
            <View style={styles.palette}>
              {preview.palette.map((c) => (
                <View key={c} style={[styles.swatch, { backgroundColor: c }]} />
              ))}
            </View>
            <Button title="Choose this style" onPress={() => choose(preview)} style={{ marginTop: spacing.xl }} />
          </View>
        )}
      </Modal>
    </Screen>
  );
}

const styles = StyleSheet.create({
  chips: { paddingHorizontal: spacing.xl, paddingVertical: spacing.lg, gap: spacing.sm },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.xl,
    borderTopRightRadius: radii.xl,
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  grabber: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: colors.taupe, marginBottom: spacing.lg },
  palette: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.lg },
  swatch: { width: 28, height: 28, borderRadius: 14, borderWidth: 1, borderColor: colors.border },
});
