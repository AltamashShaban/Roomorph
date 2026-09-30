import { MaterialCommunityIcons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Button, Header, Screen, Txt } from '@/components/ui';
import { ROOM_TYPES } from '@/config/room-types';
import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

export default function RoomTypeScreen() {
  const { draft, updateDraft } = useAppStore();

  return (
    <Screen>
      <Header step="Step 2 of 4" />
      <ScrollView contentContainerStyle={styles.body}>
        <Txt variant="h1">What room is this?</Txt>
        <Txt variant="small" style={{ marginTop: spacing.sm, marginBottom: spacing.xl }}>
          It helps us choose the right furniture.
        </Txt>
        <View style={styles.grid}>
          {ROOM_TYPES.map((r) => {
            const selected = draft.roomType === r.id;
            return (
              <Pressable
                key={r.id}
                onPress={() => updateDraft({ roomType: r.id })}
                style={({ pressed }) => [styles.card, selected && styles.cardSelected, pressed && { opacity: 0.8 }]}>
                <MaterialCommunityIcons name={r.icon as any} size={26} color={selected ? colors.onInk : colors.text} />
                <Txt variant="small" style={{ marginTop: spacing.sm, color: selected ? colors.onInk : colors.text, textAlign: 'center' }}>
                  {r.name}
                </Txt>
              </Pressable>
            );
          })}
        </View>
      </ScrollView>
      <View style={styles.footer}>
        <Button title="Continue" disabled={!draft.roomType} onPress={() => router.push('/create/style')} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.md, paddingBottom: spacing.xl },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.md },
  card: {
    width: '30%',
    flexGrow: 1,
    aspectRatio: 1,
    borderRadius: radii.md,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.sm,
  },
  cardSelected: { backgroundColor: colors.ink, borderColor: colors.ink },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm },
});
