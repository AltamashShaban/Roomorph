/**
 * Images are stored as strings. Two special forms point at bundled assets:
 *   sample:room        → the sample "before" room
 *   sample:<styleId>   → a style's sample photo (used for mock results)
 */
import { Asset } from 'expo-asset';
import { File, Paths } from 'expo-file-system';
import { Platform } from 'react-native';
import type { ImageSourcePropType } from 'react-native';

import { getStyle, SAMPLE_ROOM, SAMPLE_ROOM_URI } from '@/config/styles';

export const isSample = (uri?: string) => !!uri && uri.startsWith('sample:');

function moduleFor(uri: string) {
  if (uri === SAMPLE_ROOM_URI) return SAMPLE_ROOM;
  return getStyle(uri.slice('sample:'.length))?.image;
}

export function imageSource(uri?: string): ImageSourcePropType | undefined {
  if (!uri) return undefined;
  if (isSample(uri)) return moduleFor(uri);
  return { uri };
}

/** Resolve any stored image to a real local/remote URI (needed for AI upload). */
export async function toLocalUri(uri: string) {
  if (uri.startsWith('http') && Platform.OS !== 'web') {
    // a redesign restored from the account: fetch the photo before re-using it
    const target = new File(Paths.cache, `remote-${Date.now()}.jpg`);
    const downloaded = await File.downloadFileAsync(uri, target);
    return downloaded.uri;
  }
  if (!isSample(uri)) return uri;
  const asset = Asset.fromModule(moduleFor(uri) as number);
  await asset.downloadAsync();
  return asset.localUri ?? asset.uri;
}
