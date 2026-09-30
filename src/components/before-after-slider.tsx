/**
 * Drag-to-compare slider. `before` and `after` are any nodes that fill
 * their parent (e.g. an absolutely-filled <Image />).
 */
import { Feather } from '@expo/vector-icons';
import { useMemo, useRef, useState, type ReactNode } from 'react';
import { PanResponder, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, type } from '@/theme';

type Props = {
  before: ReactNode;
  after: ReactNode;
  aspectRatio?: number;
  style?: StyleProp<ViewStyle>;
  initial?: number; // 0..1
  labels?: boolean;
};

export function BeforeAfterSlider({ before, after, aspectRatio = 4 / 3, style, initial = 0.5, labels = true }: Props) {
  const [width, setWidth] = useState(0);
  const [pos, setPos] = useState(initial);
  const widthRef = useRef(0);
  const startRef = useRef(initial);
  const posRef = useRef(initial);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: (_, g) => Math.abs(g.dx) > Math.abs(g.dy),
        onPanResponderTerminationRequest: () => false,
        onPanResponderGrant: (e) => {
          const w = widthRef.current || 1;
          const p = clamp(e.nativeEvent.locationX / w);
          startRef.current = p;
          posRef.current = p;
          setPos(p);
        },
        onPanResponderMove: (_, g) => {
          const w = widthRef.current || 1;
          const p = clamp(startRef.current + g.dx / w);
          posRef.current = p;
          setPos(p);
        },
      }),
    [],
  );

  const x = pos * width;

  return (
    <View
      style={[styles.wrap, { aspectRatio }, style]}
      onLayout={(e) => {
        widthRef.current = e.nativeEvent.layout.width;
        setWidth(e.nativeEvent.layout.width);
      }}
      {...responder.panHandlers}>
      {/* AFTER fills the frame */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        {after}
      </View>

      {/* BEFORE is clipped to the left of the handle */}
      <View style={[styles.clip, { width: x }]} pointerEvents="none">
        <View style={{ width, height: '100%' }}>{before}</View>
      </View>

      {labels && (
        <>
          <Tag text="Before" style={{ left: 12, opacity: pos > 0.15 ? 1 : 0 }} />
          <Tag text="After" style={{ right: 12, opacity: pos < 0.85 ? 1 : 0 }} />
        </>
      )}

      {/* handle */}
      <View pointerEvents="none" style={[styles.line, { left: x - 1 }]} />
      <View pointerEvents="none" style={[styles.knob, { left: x - 20 }]}>
        <Feather name="chevron-left" size={14} color={colors.text} />
        <Feather name="chevron-right" size={14} color={colors.text} />
      </View>
    </View>
  );
}

function Tag({ text, style }: { text: string; style: StyleProp<ViewStyle> }) {
  return (
    <View pointerEvents="none" style={[styles.tag, style]}>
      <Text style={[type.label, { fontSize: 9, color: colors.text }]}>{text}</Text>
    </View>
  );
}

const clamp = (v: number) => Math.max(0, Math.min(1, v));

const styles = StyleSheet.create({
  wrap: { width: '100%', overflow: 'hidden', borderRadius: 16, backgroundColor: colors.sand },
  clip: { position: 'absolute', left: 0, top: 0, bottom: 0, overflow: 'hidden' },
  line: { position: 'absolute', top: 0, bottom: 0, width: 2, backgroundColor: '#FFFFFF' },
  knob: {
    position: 'absolute',
    top: '50%',
    marginTop: -20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tag: {
    position: 'absolute',
    top: 12,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 999,
    backgroundColor: 'rgba(255,255,255,0.85)',
  },
});
