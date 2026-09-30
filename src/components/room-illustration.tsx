/**
 * A simple drawn room used as placeholder imagery (onboarding demo, style
 * thumbnails) until real photography exists. Fills its parent.
 */
import { StyleSheet, View } from 'react-native';

export type RoomPalette = { wall: string; floor: string; sofa: string; accent: string; plant?: string };

export const DRAB: RoomPalette = { wall: '#CEC9C1', floor: '#9C958B', sofa: '#6E6962', accent: '#8C877F', plant: '#7D8278' };
export const WARM: RoomPalette = { wall: '#EFE7DB', floor: '#BFA482', sofa: '#DCCFBD', accent: '#6A5B4C', plant: '#6F8A5E' };

export function paletteFromStyle(p: [string, string, string]): RoomPalette {
  return { wall: p[0], floor: p[1], sofa: p[2], accent: p[1], plant: '#6F8A5E' };
}

export function shade(hex: string, amount: number) {
  const n = parseInt(hex.replace('#', ''), 16);
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = clamp(((n >> 16) & 255) + 255 * amount);
  const g = clamp(((n >> 8) & 255) + 255 * amount);
  const b = clamp((n & 255) + 255 * amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}

export function RoomIllustration({ palette, compact }: { palette: RoomPalette; compact?: boolean }) {
  const { wall, floor, sofa, accent, plant = '#6F8A5E' } = palette;
  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: wall, overflow: 'hidden' }]}>
      {/* floor */}
      <View style={[s.abs, { left: 0, right: 0, bottom: 0, height: '30%', backgroundColor: floor }]} />
      <View style={[s.abs, { left: 0, right: 0, bottom: '30%', height: 3, backgroundColor: shade(wall, -0.08) }]} />

      {/* window */}
      <View
        style={[
          s.abs,
          {
            left: '9%',
            top: '12%',
            width: '24%',
            height: '42%',
            backgroundColor: shade(wall, 0.1),
            borderWidth: compact ? 2 : 4,
            borderColor: shade(wall, 0.18),
            borderTopLeftRadius: 999,
            borderTopRightRadius: 999,
          },
        ]}>
        <View style={{ position: 'absolute', left: '48%', top: 0, bottom: 0, width: compact ? 1 : 2, backgroundColor: shade(wall, 0.2) }} />
      </View>

      {/* art frame */}
      <View
        style={[
          s.abs,
          {
            right: '14%',
            top: '16%',
            width: '20%',
            height: '22%',
            backgroundColor: accent,
            borderWidth: compact ? 2 : 4,
            borderColor: shade(wall, 0.12),
          },
        ]}
      />

      {/* rug */}
      <View
        style={[
          s.abs,
          { left: '18%', width: '64%', bottom: '4%', height: '12%', borderRadius: 999, backgroundColor: shade(floor, 0.12), opacity: 0.8 },
        ]}
      />

      {/* sofa */}
      <View style={[s.abs, { left: '30%', width: '46%', bottom: '24%', height: '17%', borderRadius: compact ? 6 : 12, backgroundColor: shade(sofa, -0.04) }]} />
      <View style={[s.abs, { left: '26%', width: '54%', bottom: '14%', height: '13%', borderRadius: compact ? 6 : 12, backgroundColor: sofa }]} />
      <View style={[s.abs, { left: '28%', width: '3%', bottom: '10%', height: '5%', backgroundColor: shade(sofa, -0.25) }]} />
      <View style={[s.abs, { left: '75%', width: '3%', bottom: '10%', height: '5%', backgroundColor: shade(sofa, -0.25) }]} />

      {/* plant */}
      <View style={[s.abs, { right: '6%', bottom: '14%', width: '8%', height: '10%', backgroundColor: shade(accent, 0.1), borderRadius: 4 }]} />
      <View style={[s.abs, { right: '3%', bottom: '22%', width: '14%', aspectRatio: 1, borderRadius: 999, backgroundColor: plant }]} />

      {/* floor lamp */}
      <View style={[s.abs, { left: '19%', bottom: '18%', width: 2, height: '30%', backgroundColor: shade(accent, -0.1) }]} />
      <View
        style={[
          s.abs,
          { left: '15%', bottom: '46%', width: '9%', height: '7%', backgroundColor: shade(wall, 0.15), borderTopLeftRadius: 6, borderTopRightRadius: 6 },
        ]}
      />
    </View>
  );
}

const s = StyleSheet.create({ abs: { position: 'absolute' } });
