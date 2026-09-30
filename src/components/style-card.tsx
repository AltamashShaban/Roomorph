import { Feather } from '@expo/vector-icons';
import { Pressable, StyleSheet, View, type StyleProp, type ViewStyle } from 'react-native';

import { Image } from 'expo-image';
import { Txt } from '@/components/ui';
import type { InteriorStyle } from '@/config/styles';
import { colors, radii, spacing } from '@/theme';

export function StyleThumb({
  style: st,
  aspectRatio = 1,
  variant = 'thumb',
}: {
  style: InteriorStyle;
  aspectRatio?: number;
  variant?: 'thumb' | 'room';
}) {
  return (
    <View style={{ aspectRatio, borderRadius: radii.md, overflow: 'hidden', backgroundColor: colors.sand }}>
      <Image source={variant === 'room' ? st.image : st.thumb} style={{ width: '100%', height: '100%' }} contentFit="cover" transition={150} />
    </View>
  );
}

export function StyleCard({
  item,
  selected,
  onPress,
  style,
}: {
  item: InteriorStyle;
  selected?: boolean;
  onPress?: () => void;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [{ opacity: pressed ? 0.85 : 1 }, style]}>
      <View style={[styles.frame, selected && styles.selected]}>
        <StyleThumb style={item} />
        {selected && (
          <View style={styles.check}>
            <Feather name="check" size={14} color={colors.onInk} />
          </View>
        )}
        {item.isPremium && (
          <View style={styles.premium}>
            <Feather name="star" size={10} color={colors.accent} />
          </View>
        )}
      </View>
      <Txt variant="h3" style={{ fontSize: 18, marginTop: spacing.sm }} numberOfLines={1}>
        {item.name}
      </Txt>
      <Txt variant="small" numberOfLines={1}>
        {item.description}
      </Txt>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  frame: { borderRadius: radii.md + 3, padding: 3, borderWidth: 1.5, borderColor: 'transparent' },
  selected: { borderColor: colors.ink },
  check: {
    position: 'absolute',
    right: 10,
    top: 10,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  premium: {
    position: 'absolute',
    left: 10,
    top: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(255,255,255,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
