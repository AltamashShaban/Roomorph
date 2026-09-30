import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextProps,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView, type Edge } from 'react-native-safe-area-context';

import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing, type } from '@/theme';

/* ---------- Text ---------- */

type Variant = keyof typeof type;
export function Txt({ variant = 'body', style, ...rest }: TextProps & { variant?: Variant }) {
  return <Text {...rest} style={[type[variant] as TextStyle, style]} />;
}

/* ---------- Screen ---------- */

export function Screen({
  children,
  edges = ['top', 'bottom'],
  style,
}: {
  children: ReactNode;
  edges?: Edge[];
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <SafeAreaView edges={edges} style={[{ flex: 1, backgroundColor: colors.background }, style]}>
      {children}
    </SafeAreaView>
  );
}

/* ---------- Button ---------- */

type ButtonProps = {
  title: string;
  onPress?: () => void;
  variant?: 'primary' | 'secondary' | 'ghost';
  icon?: keyof typeof Feather.glyphMap;
  disabled?: boolean;
  loading?: boolean;
  style?: StyleProp<ViewStyle>;
};

export function Button({ title, onPress, variant = 'primary', icon, disabled, loading, style }: ButtonProps) {
  const fg = variant === 'primary' ? colors.onInk : colors.text;
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled || loading}
      style={({ pressed }) => [
        styles.btn,
        variant === 'primary' && { backgroundColor: colors.ink },
        variant === 'secondary' && { backgroundColor: colors.surface, borderWidth: 1, borderColor: colors.border },
        variant === 'ghost' && { backgroundColor: 'transparent' },
        (disabled || loading) && { opacity: 0.4 },
        pressed && { opacity: 0.85, transform: [{ scale: 0.99 }] },
        style,
      ]}>
      {loading ? (
        <ActivityIndicator color={fg} />
      ) : (
        <>
          {icon && <Feather name={icon} size={16} color={fg} style={{ marginRight: spacing.sm }} />}
          <Text style={[type.button, { color: fg }]}>{title}</Text>
        </>
      )}
    </Pressable>
  );
}

/* ---------- Icon button ---------- */

export function IconButton({
  icon,
  onPress,
  label,
  style,
}: {
  icon: keyof typeof Feather.glyphMap;
  onPress?: () => void;
  label?: string;
  style?: StyleProp<ViewStyle>;
}) {
  return (
    <Pressable
      onPress={onPress}
      hitSlop={10}
      accessibilityLabel={label ?? icon}
      style={({ pressed }) => [styles.iconBtn, pressed && { opacity: 0.6 }, style]}>
      <Feather name={icon} size={20} color={colors.text} />
    </Pressable>
  );
}

/* ---------- Header ---------- */

export function Header({
  title,
  step,
  showBack = true,
  showCredits = true,
  right,
}: {
  title?: string;
  step?: string;
  showBack?: boolean;
  showCredits?: boolean;
  right?: ReactNode;
}) {
  return (
    <View style={styles.header}>
      <View style={{ width: 80 }}>
        {showBack && <IconButton icon="arrow-left" label="Back" onPress={() => router.back()} />}
      </View>
      <View style={{ flex: 1, alignItems: 'center' }}>
        {step && <Txt variant="label" style={{ color: colors.muted }}>{step}</Txt>}
        {title && <Txt variant="label">{title}</Txt>}
      </View>
      <View style={{ width: 80, alignItems: 'flex-end' }}>{right ?? (showCredits && <CreditBadge />)}</View>
    </View>
  );
}

/* ---------- Credit badge ---------- */

export function CreditBadge() {
  const { credits } = useAppStore();
  return (
    <Pressable onPress={() => router.push('/paywall')} style={({ pressed }) => [styles.credit, pressed && { opacity: 0.7 }]}>
      <Feather name="zap" size={12} color={colors.accent} />
      <Text style={styles.creditText}>{credits}</Text>
    </Pressable>
  );
}

/* ---------- Chip ---------- */

export function Chip({ label, selected, onPress }: { label: string; selected?: boolean; onPress?: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={[
        styles.chip,
        selected ? { backgroundColor: colors.ink, borderColor: colors.ink } : { backgroundColor: colors.surface },
      ]}>
      <Text style={[type.small, { color: selected ? colors.onInk : colors.text, fontSize: 13 }]}>{label}</Text>
    </Pressable>
  );
}

/* ---------- Section header ---------- */

export function SectionHeader({ title, action, onAction }: { title: string; action?: string; onAction?: () => void }) {
  return (
    <View style={styles.section}>
      <Txt variant="label">{title}</Txt>
      {action && (
        <Pressable onPress={onAction} hitSlop={8}>
          <Txt variant="label" style={{ color: colors.accent }}>
            {action}
          </Txt>
        </Pressable>
      )}
    </View>
  );
}

/* ---------- Divider ornament (from moodboard) ---------- */

export function Ornament({ color = colors.taupe }: { color?: string }) {
  return <View style={{ width: 28, height: 1, backgroundColor: color, marginVertical: spacing.md }} />;
}

const styles = StyleSheet.create({
  btn: {
    height: 54,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  iconBtn: { width: 40, height: 40, alignItems: 'center', justifyContent: 'center' },
  header: {
    height: 52,
    paddingHorizontal: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  credit: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    height: 30,
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  creditText: { ...type.small, color: colors.text, fontFamily: type.label.fontFamily },
  chip: {
    paddingHorizontal: 14,
    height: 34,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
  },
  section: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
});
