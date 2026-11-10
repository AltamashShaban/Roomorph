/**
 * Roomsera logo. PNGs cut from the brand file in /mnt/project-files/roomsera-brand/
 (transparent background).
 */
import { Image } from 'expo-image';
import { View } from 'react-native';

import { Txt } from '@/components/ui';
import { colors } from '@/theme';

const MARK = require('../../assets/brand/logo-mark.png'); // 330×292
const HORIZONTAL = require('../../assets/brand/logo-horizontal.png'); // 1138×292
const STACKED = require('../../assets/brand/logo-stacked.png'); // 584×494

/** Arch + leaf mark only. `size` = height. */
export function LogoMark({ size = 32 }: { size?: number }) {
  return <Image source={MARK} style={{ height: size, width: size * (330 / 292) }} contentFit="contain" accessibilityLabel="Roomsera" />;
}

/** Mark + "Roomsera" side by side. `height` = logo height. */
export function LogoHorizontal({ height = 28 }: { height?: number }) {
  return (
    <Image
      source={HORIZONTAL}
      style={{ height, width: height * (1138 / 292) }}
      contentFit="contain"
      accessibilityLabel="Roomsera"
    />
  );
}

/** Stacked logo (mark above name) with the brand tagline. `width` = logo width. */
export function Wordmark({ width = 200, tagline = true }: { width?: number; tagline?: boolean }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Image source={STACKED} style={{ width, height: width * (494 / 584) }} contentFit="contain" accessibilityLabel="Roomsera" />
      {tagline && (
        <Txt variant="label" style={{ color: colors.muted, letterSpacing: 4, fontSize: 10, marginTop: 14 }}>
          Spaces evolve with you
        </Txt>
      )}
    </View>
  );
}
