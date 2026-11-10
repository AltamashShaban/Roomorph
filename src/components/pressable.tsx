/**
 * Shared Pressable. On Android it uses react-native-gesture-handler's Pressable:
 * React Native's own Pressable can stop firing onPress on Android (new architecture)
 * after the app comes back from another app such as the camera or photo picker.
 * Elsewhere it is React Native's Pressable. Needs <GestureHandlerRootView> at the
 * app root and inside every <Modal>.
 */
import { forwardRef } from 'react';
import { Platform, Pressable as RNPressable, type PressableProps, type View } from 'react-native';
import { Pressable as GHPressable } from 'react-native-gesture-handler';

const Impl = (Platform.OS === 'android' ? GHPressable : RNPressable) as unknown as typeof RNPressable;

export const Pressable = forwardRef<View, PressableProps>(function Pressable(props, ref) {
  return <Impl ref={ref} {...props} />;
});
