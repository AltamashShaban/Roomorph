import { router } from 'expo-router';
import { FlatList, StyleSheet, View } from 'react-native';

import { StyleCard } from '@/components/style-card';
import { Button, Header, Screen, Txt } from '@/components/ui';
import { getStyle, STYLES } from '@/config/styles';
import { useAppStore } from '@/store/app-store';
import { colors, spacing } from '@/theme';

export default function StyleScreen() {
  const { draft, updateDraft } = useAppStore();
  const selected = getStyle(draft.styleId);

  return (
    <Screen>
      <Header step="Step 2 of 3" />
      <View style={{ paddingHorizontal: spacing.xl, paddingTop: spacing.md }}>
        <Txt variant="h1">Pick a style</Txt>
        <Txt variant="small" style={{ marginTop: spacing.sm }}>
          Choose the look for your room.
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
          <StyleCard
            item={item}
            selected={draft.styleId === item.id}
            onPress={() => updateDraft({ styleId: item.id, presetStyle: false })}
            style={{ flex: 1 / 2 }}
          />
        )}
      />

      <View style={styles.footer}>
        <Button
          title={selected ? `Continue with ${selected.name}` : 'Choose a style'}
          disabled={!selected}
          onPress={() => router.push('/create/details')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, paddingTop: spacing.sm, borderTopWidth: 1, borderTopColor: colors.border },
});
