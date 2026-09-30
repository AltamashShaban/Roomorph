import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';

import { Button, CreditBadge, Screen, Txt } from '@/components/ui';
import { getRoomType } from '@/config/room-types';
import { getStyle } from '@/config/styles';
import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

export default function History() {
  const { history, deleteRedesign, resetDraft } = useAppStore();

  const confirmDelete = (id: string) =>
    Alert.alert('Delete redesign?', 'This removes it from your history.', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteRedesign(id) },
    ]);

  return (
    <Screen edges={['top']}>
      <View style={styles.top}>
        <View>
          <Txt variant="label" style={{ color: colors.muted }}>
            {history.length} {history.length === 1 ? 'redesign' : 'redesigns'}
          </Txt>
          <Txt variant="h1" style={{ marginTop: 2 }}>
            Your spaces
          </Txt>
        </View>
        <CreditBadge />
      </View>

      {history.length === 0 ? (
        <View style={styles.empty}>
          <View style={styles.emptyIcon}>
            <Feather name="image" size={24} color={colors.muted} />
          </View>
          <Txt variant="h2" style={{ marginTop: spacing.lg, textAlign: 'center' }}>
            Nothing here yet
          </Txt>
          <Txt variant="small" style={{ marginTop: spacing.sm, textAlign: 'center' }}>
            Your redesigns will appear here.
          </Txt>
          <Button
            title="Redesign a room"
            icon="camera"
            onPress={() => {
              resetDraft();
              router.push('/create/capture');
            }}
            style={{ marginTop: spacing.xl, alignSelf: 'stretch' }}
          />
        </View>
      ) : (
        <FlatList
          data={history}
          numColumns={2}
          keyExtractor={(r) => r.id}
          columnWrapperStyle={{ gap: spacing.md }}
          contentContainerStyle={{ paddingHorizontal: spacing.xl, paddingBottom: spacing.xxl, gap: spacing.lg }}
          renderItem={({ item }) => (
            <Pressable
              onPress={() => router.push(`/result/${item.id}`)}
              onLongPress={() => confirmDelete(item.id)}
              style={({ pressed }) => [{ flex: 1 / 2, opacity: pressed ? 0.85 : 1 }]}>
              <View style={styles.img}>
                <Image source={{ uri: item.afterUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
                {item.mock && (
                  <View style={[StyleSheet.absoluteFill, { backgroundColor: getStyle(item.styleId)?.palette[1], opacity: 0.35 }]} />
                )}
              </View>
              <Txt variant="h3" style={{ fontSize: 18, marginTop: spacing.sm }} numberOfLines={1}>
                {getStyle(item.styleId)?.name}
              </Txt>
              <Txt variant="small" numberOfLines={1}>
                {getRoomType(item.roomType)?.name} · {new Date(item.createdAt).toLocaleDateString()}
              </Txt>
            </Pressable>
          )}
          ListFooterComponent={
            <Txt variant="small" style={{ textAlign: 'center', marginTop: spacing.md, fontSize: 12 }}>
              Long-press a redesign to delete it
            </Txt>
          }
        />
      )}
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
    paddingBottom: spacing.xl,
  },
  img: { aspectRatio: 1, borderRadius: radii.md, overflow: 'hidden', backgroundColor: colors.sand },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.xxl, paddingBottom: spacing.xxxl },
  emptyIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
