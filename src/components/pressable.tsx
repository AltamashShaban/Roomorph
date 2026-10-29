/**
 * Pressable that keeps working on Android after the app comes back from another
 * app (camera, photo picker, Google sign-in). There, React Native can mis-measure
 * a button's position on screen, so every tap looks like the finger slid off and
 * onPress never fires. A huge press-retention area makes the release always count.
 * Scrolling still cancels a press, as before.
 */
import { forwardRef } from 'react';
import { Platform, Pressable as RNPressable, type PressableProps, type View } from 'react-native';

const RETENTION = Platform.OS === 'android' ? 10000 : undefined;

export const Pressable = forwardRef<View, PressableProps>(function Pressable(props, ref) {
  return <RNPressable ref={ref} pressRetentionOffset={RETENTION} {...props} />;
});
