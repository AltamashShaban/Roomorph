/**
 * Floating pill tab bar: white capsule; the active tab expands into a soft
 * sand pill showing its icon + label. Switching tabs eases the pill open/closed.
 */
import { Feather } from '@expo/vector-icons';
import type { BottomTabBarProps } from 'expo-router/js-tabs';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, fonts, radii, spacing } from '@/theme';

const ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: 'home',
  history: 'clock',
  settings: 'settings',
};

const ITEM = 56; // collapsed width (icon only)
const GAP = spacing.sm; // icon ↔ label
const PAD_X = spacing.xl - 4; // extra side padding when open
const DURATION = 320;

/** Space screens should leave at the bottom so content can scroll clear of the floating bar. */
export const TAB_BAR_SPACE = 110;

export function PillTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();

  return (
    <View pointerEvents="box-none" style={[styles.wrap, { bottom: Math.max(insets.bottom, spacing.lg) }]}>
      <View style={styles.bar}>
        {state.routes.map((route, index) => {
          const focused = state.index === index;
          const { options } = descriptors[route.key];
          const label = typeof options.title === 'string' ? options.title : route.name;

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name, route.params);
          };

          return <TabItem key={route.key} label={label} icon={ICONS[route.name] ?? 'circle'} focused={focused} onPress={onPress} />;
        })}
      </View>
    </View>
  );
}

function TabItem({
  label,
  icon,
  focused,
  onPress,
}: {
  label: string;
  icon: keyof typeof Feather.glyphMap;
  focused: boolean;
  onPress: () => void;
}) {
  const progress = useRef(new Animated.Value(focused ? 1 : 0)).current;
  const [labelW, setLabelW] = useState(0);

  useEffect(() => {
    Animated.timing(progress, {
      toValue: focused ? 1 : 0,
      duration: DURATION,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  }, [focused, progress]);

  const openW = ITEM + GAP + labelW + PAD_X;
  const width = progress.interpolate({ inputRange: [0, 1], outputRange: [ITEM, labelW ? openW : ITEM] });
  const bg = progress.interpolate({ inputRange: [0, 1], outputRange: ['rgba(234,221,203,0)', 'rgba(234,221,203,1)'] });
  const labelOpacity = progress.interpolate({ inputRange: [0, 0.5, 1], outputRange: [0, 0, 1] });
  const labelSlotW = progress.interpolate({ inputRange: [0, 1], outputRange: [0, labelW + GAP] });

  return (
    <Pressable onPress={onPress} accessibilityRole="tab" accessibilityState={{ selected: focused }} accessibilityLabel={label}>
      {({ pressed }) => (
        <Animated.View style={[styles.item, { width, backgroundColor: bg, opacity: pressed && !focused ? 0.7 : 1 }]}>
          <Feather name={icon} size={20} color={focused ? colors.charcoal : colors.muted} />
          <Animated.View style={{ width: labelSlotW, overflow: 'hidden', opacity: labelOpacity }}>
            <Text style={[styles.label, { marginLeft: GAP, width: labelW || undefined }]}>
              {label}
            </Text>
          </Animated.View>
          {/* invisible copy to measure the label's natural width */}
          <View style={styles.measure} pointerEvents="none">
            <Text style={styles.label} onLayout={(e) => setLabelW(Math.ceil(e.nativeEvent.layout.width) + 2)}>
              {label}
            </Text>
          </View>
        </Animated.View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: { position: 'absolute', left: 0, right: 0, alignItems: 'center' },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: radii.pill,
    padding: 6,
    gap: 2,
    borderWidth: 1,
    borderColor: 'rgba(59, 59, 54, 0.06)',
    shadowColor: colors.charcoal,
    shadowOpacity: 0.12,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  item: {
    height: 48,
    borderRadius: radii.pill,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  label: { fontFamily: fonts.sansMedium, fontSize: 14, color: colors.charcoal },
  // wide, unconstrained box so the label measures at its natural width
  measure: { position: 'absolute', left: -9999, top: 0, width: 400, flexDirection: 'row', opacity: 0 },
});
