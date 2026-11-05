/**
 * Forced update: the server keeps the oldest Android build we still allow
 * (public.app_config.min_android_build). Older builds see a full screen
 * asking people to update from the Play Store. Any error lets the app open,
 * so a network hiccup never locks anyone out.
 */
import * as Application from 'expo-application';
import { useEffect, useState } from 'react';
import { AppState, Linking, Platform, StyleSheet, View } from 'react-native';

import { LogoMark } from '@/components/logo';
import { Button, Screen, Txt } from '@/components/ui';
import { supabase } from '@/lib/supabase';
import { spacing } from '@/theme';

const PACKAGE = 'com.altamash.roomorph';

async function isUpdateRequired() {
  if (Platform.OS !== 'android' || !supabase) return false;
  const build = Number(Application.nativeBuildVersion);
  if (!Number.isFinite(build) || build <= 0) return false;
  try {
    const { data, error } = await supabase.from('app_config').select('min_android_build').eq('id', 1).maybeSingle();
    if (error || !data) return false;
    return build < Number(data.min_android_build ?? 0);
  } catch {
    return false;
  }
}

/** Checks on launch and whenever the app comes back to the foreground. */
export function useUpdateRequired() {
  const [required, setRequired] = useState(false);
  useEffect(() => {
    let alive = true;
    const check = () => isUpdateRequired().then((r) => alive && setRequired(r));
    check();
    const sub = AppState.addEventListener('change', (s) => s === 'active' && check());
    return () => {
      alive = false;
      sub.remove();
    };
  }, []);
  return required;
}

function openStore() {
  Linking.openURL(`market://details?id=${PACKAGE}`).catch(() =>
    Linking.openURL(`https://play.google.com/store/apps/details?id=${PACKAGE}`),
  );
}

export function UpdateRequired() {
  return (
    <Screen>
      <View style={styles.body}>
        <LogoMark size={56} />
        <Txt variant="h1" style={styles.center}>
          Time to update
        </Txt>
        <Txt style={styles.center}>
          This version of Roomsera is out of date. Update from the Play Store to keep redesigning your rooms.
        </Txt>
      </View>
      <View style={styles.footer}>
        <Button title="Update Roomsera" icon="download" onPress={openStore} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md, paddingHorizontal: spacing.xl },
  center: { textAlign: 'center' },
  footer: { padding: spacing.lg },
});
