/**
 * Price-tag pins drawn over the redesigned image. Each pin marks a new piece
 * of furniture; tapping it opens the shopping list focused on that item.
 */
import { Image } from 'expo-image';
import { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Pressable, StyleSheet, Text, View, type ImageSourcePropType } from 'react-native';

import { coverPoint, formatPrice, type ShopItem } from '@/config/shop';
import { colors, fonts, radii } from '@/theme';

type Props = {
  items: ShopItem[];
  imageAspect: number; // width / height of the image the points refer to
  onPressItem: (item: ShopItem) => void;
};

export function ShopHotspots({ items, imageAspect, onPressItem }: Props) {
  const [size, setSize] = useState({ w: 0, h: 0 });
  const frameAspect = size.h ? size.w / size.h : 1;

  return (
    <View
      style={StyleSheet.absoluteFill}
      pointerEvents="box-none"
      onLayout={(e) => setSize({ w: e.nativeEvent.layout.width, h: e.nativeEvent.layout.height })}>
      {/* soft scrim so the tags read on bright and dark images */}
      <View pointerEvents="none" style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(59,59,54,0.18)' }]} />
      {size.w > 0 &&
        placePins(items, imageAspect, frameAspect, size.w, size.h).map(({ item, x, y, side, tagX, tagW }, index) => (
          <Pin
            key={item.id}
            item={item}
            index={index}
            left={x}
            top={y}
            frameW={size.w}
            side={side}
            tagX={tagX}
            tagW={tagW}
            onPress={() => onPressItem(item)}
          />
        ))}
    </View>
  );
}

type Side = 'right' | 'left' | 'above' | 'below';
type Box = { x1: number; y1: number; x2: number; y2: number };

const DOT = 24;
const TAG_H = 22;
const GAP = 6;
const tagWidth = (item: ShopItem) => 20 + `from ${formatPrice(item.priceMin)}`.length * 6.8;

/**
 * Decide which side of its dot each price tag sits on, so tags don't cover
 * each other, run off the image, or sit under the "Hide tags" button.
 */
function placePins(items: ShopItem[], imageAspect: number, frameAspect: number, W: number, H: number) {
  const pts = items
    .map((item) => ({ item, p: coverPoint(item.x, item.y, imageAspect, frameAspect) }))
    .filter((d): d is { item: ShopItem; p: { x: number; y: number } } => !!d.p)
    .map(({ item, p }) => ({ item, x: p.x * W, y: p.y * H }));

  // every dot is an obstacle; so is the button in the bottom-left corner
  const taken: Box[] = pts.map(({ x, y }) => ({ x1: x - DOT / 2, y1: y - DOT / 2, x2: x + DOT / 2, y2: y + DOT / 2 }));
  taken.push({ x1: 0, y1: H - 56, x2: 150, y2: H });

  // how badly a tag box collides: overlap area with other tags/dots, plus a big penalty off-image
  const cost = (b: Box) => {
    let c = 0;
    if (b.x1 < 4 || b.y1 < 4 || b.x2 > W - 4 || b.y2 > H - 4) c += 1e6;
    for (const t of taken) {
      const ox = Math.min(b.x2, t.x2) - Math.max(b.x1, t.x1);
      const oy = Math.min(b.y2, t.y2) - Math.max(b.y1, t.y1);
      if (ox > 0 && oy > 0) c += ox * oy;
    }
    return c;
  };

  // place the most crowded (top-to-bottom) first so later tags work around them
  return [...pts]
    .sort((a, b) => a.y - b.y)
    .map(({ item, x, y }) => {
      const w = tagWidth(item);
      // tags above/below are centred on the dot but slide inward near the edges
      const tx = Math.min(Math.max(x - w / 2, 6), W - 6 - w);
      const boxes: Record<Side, Box> = {
        right: { x1: x + DOT / 2 + GAP, y1: y - TAG_H / 2, x2: x + DOT / 2 + GAP + w, y2: y + TAG_H / 2 },
        left: { x1: x - DOT / 2 - GAP - w, y1: y - TAG_H / 2, x2: x - DOT / 2 - GAP, y2: y + TAG_H / 2 },
        above: { x1: tx, y1: y - DOT / 2 - 4 - TAG_H, x2: tx + w, y2: y - DOT / 2 - 4 },
        below: { x1: tx, y1: y + DOT / 2 + 4, x2: tx + w, y2: y + DOT / 2 + 4 + TAG_H },
      };
      const order: Side[] = x > W * 0.62 ? ['left', 'right', 'above', 'below'] : ['right', 'left', 'above', 'below'];
      // first clear side in preference order, otherwise the least-crowded one
      const side = order.find((sd) => cost(boxes[sd]) === 0) ?? order.reduce((best, sd) => (cost(boxes[sd]) < cost(boxes[best]) ? sd : best));
      taken.push(boxes[side]);
      return { item, x, y, side, tagX: tx, tagW: w };
    });
}

function Pin({
  item,
  index,
  left,
  top,
  frameW,
  side,
  tagX,
  tagW,
  onPress,
}: {
  item: ShopItem;
  index: number;
  left: number;
  top: number;
  frameW: number;
  side: Side;
  tagX: number;
  tagW: number;
  onPress: () => void;
}) {
  const appear = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    Animated.timing(appear, {
      toValue: 1,
      duration: 260,
      delay: 70 * index,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [appear, index]);

  return (
    <Animated.View
      style={[
        styles.pinWrap,
        // anchor so the dot's centre sits exactly on the item
        anchor(side, left, top, frameW, tagX, tagW),
        { opacity: appear, transform: [{ scale: appear.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }] },
      ]}>
      <Pressable
        onPress={onPress}
        hitSlop={8}
        accessibilityLabel={`${item.name}, from ${formatPrice(item.priceMin)}`}
        style={[styles.pinRow, PIN_LAYOUT[side]]}>
        <View style={[styles.dotOuter, (side === 'above' || side === 'below') && { marginLeft: left - tagX - DOT / 2 }]}>
          <View style={styles.dotInner} />
        </View>
        <View style={styles.tag}>
          <Text style={styles.tagText}>from {formatPrice(item.priceMin)}</Text>
        </View>
      </Pressable>
    </Animated.View>
  );
}

const PIN_LAYOUT = {
  right: { flexDirection: 'row' as const, gap: GAP },
  left: { flexDirection: 'row-reverse' as const, gap: GAP },
  above: { flexDirection: 'column-reverse' as const, gap: 4, alignItems: 'flex-start' as const },
  below: { flexDirection: 'column' as const, gap: 4, alignItems: 'flex-start' as const },
};

function anchor(side: Side, x: number, y: number, W: number, tagX: number, tagW: number) {
  const r = DOT / 2;
  switch (side) {
    case 'right':
      return { left: x - r, top: y - r };
    case 'left':
      return { right: W - x - r, top: y - r };
    // above/below: the wrapper spans the tag; the dot is nudged to sit over the item
    case 'above':
      return { left: tagX, width: Math.max(tagW, x - tagX + r), top: y + r - (DOT + 4 + TAG_H) };
    case 'below':
      return { left: tagX, width: Math.max(tagW, x - tagX + r), top: y - r };
  }
}

/** A zoomed crop of the image centred on an item — used as the item thumbnail. */
export function ItemCrop({
  source,
  x,
  y,
  imageAspect,
  size = 84,
  zoom = 2.6,
}: {
  source: ImageSourcePropType | undefined;
  x: number;
  y: number;
  imageAspect: number;
  size?: number;
  zoom?: number;
}) {
  const w = size * zoom * Math.max(1, imageAspect);
  const h = w / imageAspect;
  const left = Math.min(0, Math.max(size - w, size / 2 - x * w));
  const top = Math.min(0, Math.max(size - h, size / 2 - y * h));
  return (
    <View style={{ width: size, height: size, borderRadius: radii.sm, overflow: 'hidden', backgroundColor: colors.sand }}>
      <Image source={source} style={{ position: 'absolute', width: w, height: h, left, top }} contentFit="cover" />
    </View>
  );
}

const styles = StyleSheet.create({
  pinWrap: { position: 'absolute' },
  pinRow: { alignItems: 'center' },
  dotOuter: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  dotInner: { width: 10, height: 10, borderRadius: 5, backgroundColor: '#FFFFFF' },
  tag: {
    height: TAG_H,
    justifyContent: 'center',
    paddingHorizontal: 9,
    borderRadius: radii.pill,
    backgroundColor: 'rgba(255,253,249,0.95)',
    shadowColor: '#000',
    shadowOpacity: 0.18,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  tagText: { fontFamily: fonts.sansSemiBold, fontSize: 11, color: colors.charcoal },
});
