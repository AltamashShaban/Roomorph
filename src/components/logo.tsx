/**
 * Roomorph logo. Source vectors live in assets/brand/logo-*.svg; the app uses
 * high-res PNG exports of them (React Native has no built-in SVG renderer).
 */
import { Image } from 'expo-image';
import { View } from 'react-native';

import { Txt } from '@/components/ui';
import { colors } from '@/theme';

const MARK = require('../../assets/brand/logo-mark.png'); // 632×587
const HORIZONTAL = require('../../assets/brand/logo-horizontal.png'); // 2192×587
const STACKED = require('../../assets/brand/logo-stacked.png'); // 1473×1276

/** Arch + leaf mark only. `size` = height. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return <Image source={MARK} style={{ height: size, width: size * (632 / 587) }} contentFit="contain" accessibilityLabel="Roomorph" />;
}

/** Mark + "Roomorph" side by side. `height` = logo height. */
export function LogoHorizontal({ height = 28 }: { height?: number }) {
  return (
    <Image
      source={HORIZONTAL}
      style={{ height, width: height * (2192 / 587) }}
      contentFit="contain"
      accessibilityLabel="Roomorph"
    />
  );
}

/** Stacked logo (mark above name) with the brand tagline. `width` = logo width. */
export function Wordmark({ width = 200, tagline = true }: { width?: number; tagline?: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={STACKED} style={{ width, height: width * (1276 / 1473) }} contentFit="contain" accessibilityLabel="Roomorph" />
      {tagline && (
        <Txt variant="label" style={{ color: colors.muted, letterSpacing: 4, fontSize: 10, marginTop: 14 }}>
          Spaces evolve with you
        </Txt>
      )}
    </View>
  );
}
