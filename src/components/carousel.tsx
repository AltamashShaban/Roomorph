/**
 * Horizontal row with a section heading and small ‹ › arrows on the right.
 * Arrows scroll by roughly two cards and fade out at either end. Swiping
 * still works on touch; the arrows make it usable with a mouse too.
 */
import { Feather } from '@expo/vector-icons';
import { useRef, useState, type ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { Txt } from '@/components/ui';
import { colors, spacing } from '@/theme';

type Props = {
  title: string;
  action?: string;
  onAction?: () => void;
  itemWidth?: number;
  children: ReactNode;
};

export function Carousel({ title, action, onAction, itemWidth = 150, children }: Props) {
  const ref = useRef<ScrollView>(null);
  const [x, setX] = useState(0);
  const [viewW, setViewW] = useState(0);
  const [contentW, setContentW] = useState(0);

  const maxX = Math.max(0, contentW - viewW);
  const canLeft = x > 4;
  const canRight = x < maxX - 4;
  const step = (itemWidth + spacing.md) * 2;

  const go = (dir: 1 | -1) => {
    const next = Math.max(0, Math.min(maxX, x + dir * step));
    ref.current?.scrollTo({ x: next, animated: true });
    setX(next);
  };

  return (
    <View>
      <View style={styles.head}>
        <Txt variant="label">{title}</Txt>
        <View style={styles.right}>
          {action && (
            <Pressable onPress={onAction} hitSlop={8}>
              <Txt variant="label" style={{ color: colors.accent }}>
                {action}
              </Txt>
            </Pressable>
          )}
          {maxX > 0 && (
            <View style={styles.arrows}>
              <Arrow icon="chevron-left" label={`Scroll ${title} left`} enabled={canLeft} onPress={() => go(-1)} />
              <Arrow icon="chevron-right" label={`Scroll ${title} right`} enabled={canRight} onPress={() => go(1)} />
            </View>
          )}
        </View>
      </View>
      <ScrollView
        ref={ref}
        horizontal
        showsHorizontalScrollIndicator={false}
        scrollEventThrottle={32}
        onScroll={(e) => setX(e.nativeEvent.contentOffset.x)}
        onLayout={(e) => setViewW(e.nativeEvent.layout.width)}
        onContentSizeChange={(w) => setContentW(w)}
        contentContainerStyle={styles.list}>
        {children}
      </ScrollView>
    </View>
  );
}

function Arrow({ icon, label, enabled, onPress }: { icon: 'chevron-left' | 'chevron-right'; label: string; enabled: boolean; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      disabled={!enabled}
      accessibilityLabel={label}
      hitSlop={6}
      style={({ pressed }) => [styles.arrow, !enabled && { opacity: 0.35 }, pressed && { backgroundColor: colors.surfaceAlt }]}>
      <Feather name={icon} size={16} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  head: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    marginBottom: spacing.md,
  },
  right: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  arrows: { flexDirection: 'row', gap: 6 },
  arrow: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  list: { paddingHorizontal: spacing.xl, gap: spacing.md },
});
