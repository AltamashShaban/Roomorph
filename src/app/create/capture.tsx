import { Feather } from '@expo/vector-icons';
import { Image } from 'expo-image';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import { useState } from 'react';
import { Alert, Linking, StyleSheet, View } from 'react-native';

import { Button, Header, Screen, Txt } from '@/components/ui';
import { prepareImage } from '@/lib/image';
import { useAppStore } from '@/store/app-store';
import { colors, radii, spacing } from '@/theme';

const TIPS: [string, string][] = [
  ['maximize', 'Stand in a corner'],
  ['smartphone', 'Hold horizontally'],
  ['sun', 'Good lighting'],
];

export default function Capture() {
  const { draft, updateDraft } = useAppStore();
  const [busy, setBusy] = useState(false);

  const handleAsset = async (asset?: ImagePicker.ImagePickerAsset) => {
    if (!asset) return;
    setBusy(true);
    try {
      const img = await prepareImage(asset.uri, asset.width, asset.height);
      updateDraft({ photoUri: img.uri, width: img.width, height: img.height });
    } catch {
      Alert.alert('Could not use that photo', 'Please try another one.');
    } finally {
      setBusy(false);
    }
  };

  const takePhoto = async () => {
    const perm = await ImagePicker.requestCameraPermissionsAsync();
    if (!perm.granted) {
      Alert.alert('Camera access needed', 'Allow camera access to photograph your room.', [
        { text: 'Not now', style: 'cancel' },
        { text: 'Open Settings', onPress: () => Linking.openSettings() },
      ]);
      return;
    }
    const res = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 1 });
    if (!res.canceled) handleAsset(res.assets[0]);
  };

  const pickPhoto = async () => {
    const res = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 1 });
    if (!res.canceled) handleAsset(res.assets[0]);
  };

  const hasPhoto = !!draft.photoUri;

  return (
    <Screen>
      <Header step="Step 1 of 4" />
      <View style={styles.body}>
        <Txt variant="h1">{hasPhoto ? 'Looking good' : 'Capture your room'}</Txt>
        <Txt variant="small" style={{ marginTop: spacing.sm }}>
          {hasPhoto ? 'Happy with this shot? You can retake it anytime.' : 'A wide, well-lit photo gives the best redesign.'}
        </Txt>

        <View style={styles.frame}>
          {hasPhoto ? (
            <Image source={{ uri: draft.photoUri }} style={StyleSheet.absoluteFill} contentFit="cover" />
          ) : (
            <>
              {/* Framing guide: rule-of-thirds grid + corner marks */}
              <View style={[styles.gridV, { left: '33.3%' }]} />
              <View style={[styles.gridV, { left: '66.6%' }]} />
              <View style={[styles.gridH, { top: '33.3%' }]} />
              <View style={[styles.gridH, { top: '66.6%' }]} />
              {(['tl', 'tr', 'bl', 'br'] as const).map((c) => (
                <View key={c} style={[styles.corner, cornerStyle(c)]} />
              ))}
              <View style={styles.guideCenter}>
                <Feather name="camera" size={28} color={colors.muted} />
                <Txt variant="label" style={{ color: colors.muted, marginTop: spacing.sm }}>
                  Frame the whole room
                </Txt>
              </View>
            </>
          )}
        </View>

        <View style={styles.tips}>
          {TIPS.map(([icon, text]) => (
            <View key={text} style={styles.tip}>
              <Feather name={icon as any} size={16} color={colors.accent} />
              <Txt variant="small" style={{ fontSize: 12, textAlign: 'center' }}>
                {text}
              </Txt>
            </View>
          ))}
        </View>
      </View>

      <View style={styles.footer}>
        {hasPhoto ? (
          <>
            <Button title="Continue" onPress={() => router.push('/create/room-type')} />
            <View style={styles.row}>
              <Button title="Retake" variant="secondary" icon="camera" onPress={takePhoto} style={{ flex: 1 }} />
              <Button title="Gallery" variant="secondary" icon="image" onPress={pickPhoto} style={{ flex: 1 }} />
            </View>
          </>
        ) : (
          <>
            <Button title="Take a photo" icon="camera" onPress={takePhoto} loading={busy} />
            <Button title="Choose from gallery" variant="secondary" icon="image" onPress={pickPhoto} disabled={busy} />
          </>
        )}
      </View>
    </Screen>
  );
}

function cornerStyle(c: 'tl' | 'tr' | 'bl' | 'br') {
  const size = { width: 22, height: 22 };
  const b = 2;
  switch (c) {
    case 'tl':
      return { ...size, left: 14, top: 14, borderLeftWidth: b, borderTopWidth: b };
    case 'tr':
      return { ...size, right: 14, top: 14, borderRightWidth: b, borderTopWidth: b };
    case 'bl':
      return { ...size, left: 14, bottom: 14, borderLeftWidth: b, borderBottomWidth: b };
    case 'br':
      return { ...size, right: 14, bottom: 14, borderRightWidth: b, borderBottomWidth: b };
  }
}

const styles = StyleSheet.create({
  body: { flex: 1, paddingHorizontal: spacing.xl, paddingTop: spacing.md },
  frame: {
    marginTop: spacing.xl,
    width: '100%',
    aspectRatio: 4 / 3,
    borderRadius: radii.lg,
    backgroundColor: colors.surfaceAlt,
    overflow: 'hidden',
  },
  gridV: { position: 'absolute', top: 0, bottom: 0, width: 1, backgroundColor: 'rgba(138,128,118,0.18)' },
  gridH: { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: 'rgba(138,128,118,0.18)' },
  corner: { position: 'absolute', borderColor: colors.text },
  guideCenter: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, alignItems: 'center', justifyContent: 'center' },
  tips: { flexDirection: 'row', marginTop: spacing.xl, gap: spacing.sm },
  tip: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: spacing.md,
    borderRadius: radii.sm,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  footer: { paddingHorizontal: spacing.xl, paddingBottom: spacing.sm, gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
});
