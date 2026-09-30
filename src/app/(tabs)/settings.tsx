import { Feather } from '@expo/vector-icons';
import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { Pressable, ScrollView, StyleSheet, View } from 'react-native';

import { showAlert } from '@/components/dialog';

import { Screen, Txt } from '@/components/ui';
import { isLiveAI, OPENAI_MODEL } from '@/lib/generate';
import { TAB_BAR_SPACE } from '@/components/pill-tab-bar';
import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

const soon = (what: string) => () => showAlert(what, 'Coming in the full build — not part of the prototype.');

export default function Settings() {
  const { credits, addCredits, resetOnboarding, resetAll } = useAppStore();

  return (
    <Screen edges={['top']}>
      <ScrollView contentContainerStyle={styles.body}>
        <Txt variant="h1" style={{ marginBottom: spacing.xl }}>
          Settings
        </Txt>

        <Group title="Account">
          <Row icon="user" label="Sign in" detail="Apple · Google" onPress={soon('Sign in')} />
          <Row icon="zap" label="Credits" detail={`${credits}`} onPress={() => router.push('/paywall')} />
          <Row icon="rotate-ccw" label="Restore purchases" onPress={soon('Restore purchases')} />
        </Group>

        <Group title="About">
          <Row icon="shield" label="Privacy policy" onPress={soon('Privacy policy')} />
          <Row icon="file-text" label="Terms of use" onPress={soon('Terms of use')} />
          <Row
            icon="trash-2"
            label="Delete account"
            danger
            onPress={() =>
              showAlert('Delete account?', 'In the prototype this wipes all local data and history.', [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: resetAll },
              ])
            }
          />
        </Group>

        <Group title="Prototype tools">
          <Row
            icon="cpu"
            label="AI mode"
            detail={isLiveAI() ? `Live · ${OPENAI_MODEL}` : 'Mock'}
            onPress={() =>
              showAlert(
                'AI mode',
                isLiveAI()
                  ? 'Live mode: generations call OpenAI directly using the key in .env. Prototype only — never ship a key inside the app.'
                  : 'Mock mode: add EXPO_PUBLIC_OPENAI_API_KEY to a .env file and restart Expo to generate real redesigns.',
              )
            }
          />
          <Row icon="plus-circle" label="Add 10 test credits" onPress={() => addCredits(10)} />
          <Row icon="play-circle" label="Replay onboarding" onPress={resetOnboarding} />
        </Group>

        <Txt variant="small" style={{ textAlign: 'center', marginTop: spacing.xl, fontSize: 12 }}>
          Roomorph · prototype v0.1
        </Txt>
      </ScrollView>
    </Screen>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={{ marginBottom: spacing.xl }}>
      <Txt variant="label" style={{ color: colors.muted, marginBottom: spacing.sm }}>
        {title}
      </Txt>
      <View style={styles.group}>{children}</View>
    </View>
  );
}

function Row({
  icon,
  label,
  detail,
  onPress,
  danger,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  detail?: string;
  onPress?: () => void;
  danger?: boolean;
}) {
  const color = danger ? colors.danger : colors.text;
  return (
    <Pressable onPress={onPress} style={({ pressed }) => [styles.row, pressed && { backgroundColor: colors.surfaceAlt }]}>
      <Feather name={icon} size={18} color={color} />
      <Txt variant="body" style={{ flex: 1, color }}>
        {label}
      </Txt>
      {detail && <Txt variant="small">{detail}</Txt>}
      <Feather name="chevron-right" size={16} color={colors.taupe} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  body: { paddingHorizontal: spacing.xl, paddingTop: spacing.lg, paddingBottom: TAB_BAR_SPACE },
  group: { backgroundColor: colors.surface, borderRadius: radii.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    height: 54,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
});
