/**
 * On-brand replacement for Alert.alert that also works on web.
 * Usage: showAlert('Title', 'Message', [{ text: 'OK', onPress }])
 */
import { useEffect, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radii, spacing, type } from '@/theme';

export type DialogButton = { text: string; style?: 'default' | 'cancel' | 'destructive'; onPress?: () => void };
type DialogState = { title: string; message?: string; buttons: DialogButton[] } | null;

let setter: ((d: DialogState) => void) | null = null;

export function showAlert(title: string, message?: string, buttons?: DialogButton[]) {
  const b = buttons && buttons.length ? buttons : [{ text: 'OK' }];
  if (setter) setter({ title, message, buttons: b });
}

export function DialogHost() {
  const [dialog, setDialog] = useState<DialogState>(null);
  useEffect(() => {
    setter = setDialog;
    return () => {
      setter = null;
    };
  }, []);

  const press = (b: DialogButton) => {
    setDialog(null);
    setTimeout(() => b.onPress?.(), 10);
  };

  return (
    <Modal visible={!!dialog} transparent animationType="fade" onRequestClose={() => setDialog(null)}>
      <View style={styles.backdrop}>
        {dialog && (
          <View style={styles.card}>
            <Text style={[type.h2, { textAlign: 'center' }]}>{dialog.title}</Text>
            {dialog.message ? <Text style={[type.small, styles.message]}>{dialog.message}</Text> : null}
            <View style={[styles.buttons, dialog.buttons.length > 2 && { flexDirection: 'column' }]}>
              {dialog.buttons.map((b) => {
                const primary = b.style !== 'cancel';
                const bg = b.style === 'destructive' ? colors.danger : primary ? colors.ink : colors.surface;
                return (
                  <Pressable
                    key={b.text}
                    onPress={() => press(b)}
                    style={({ pressed }) => [
                      styles.btn,
                      { backgroundColor: bg, borderColor: primary ? bg : colors.border },
                      pressed && { opacity: 0.85 },
                    ]}>
                    <Text style={[type.button, { color: primary ? colors.onInk : colors.text }]}>{b.text}</Text>
                  </Pressable>
                );
              })}
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { flex: 1, backgroundColor: colors.overlay, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  card: { width: '100%', maxWidth: 360, backgroundColor: colors.background, borderRadius: radii.lg, padding: spacing.xl },
  message: { textAlign: 'center', marginTop: spacing.sm, color: colors.muted },
  buttons: { flexDirection: 'row', gap: spacing.sm, marginTop: spacing.xl },
  btn: { flex: 1, height: 48, borderRadius: radii.sm, borderWidth: 1, alignItems: 'center', justifyContent: 'center', paddingHorizontal: spacing.md },
});
