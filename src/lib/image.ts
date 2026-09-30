import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';
import { Platform } from 'react-native';

const IS_WEB = Platform.OS === 'web';
// Web keeps images as data URIs in browser storage, so keep them smaller there.
export const MAX_EDGE = IS_WEB ? 1024 : 1536;

export type PreparedImage = { uri: string; width: number; height: number };

/** Resize so the long edge is ≤ MAX_EDGE and re-encode as JPEG. */
export async function prepareImage(uri: string, width: number, height: number): Promise<PreparedImage> {
  const longEdge = Math.max(width, height);
  const ctx = ImageManipulator.manipulate(uri);
  if (longEdge > MAX_EDGE) {
    if (width >= height) ctx.resize({ width: MAX_EDGE });
    else ctx.resize({ height: MAX_EDGE });
  }
  const rendered = await ctx.renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: IS_WEB ? 0.72 : 0.82, base64: IS_WEB });
  const out = IS_WEB && result.base64 ? `data:image/jpeg;base64,${result.base64}` : result.uri;
  return { uri: out, width: result.width, height: result.height };
}

function photosDir() {
  const dir = new Directory(Paths.document, 'redesigns');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** Copy a (cache) image into permanent app storage so history survives restarts. */
export function persistImage(uri: string, name: string) {
  if (IS_WEB || uri.startsWith('sample:')) return uri; // data URI — already self-contained
  const target = new File(photosDir(), name);
  if (target.exists) target.delete();
  new File(uri).copy(target);
  return target.uri;
}

export function writeBase64Image(base64: string, name: string) {
  if (IS_WEB) return `data:image/jpeg;base64,${base64}`;
  const file = new File(photosDir(), name);
  if (file.exists) file.delete();
  file.create();
  file.write(base64, { encoding: 'base64' });
  return file.uri;
}

export async function readBase64(uri: string) {
  if (uri.startsWith('data:')) return uri.slice(uri.indexOf(',') + 1);
  return new File(uri).base64();
}

export function deleteImage(uri?: string) {
  if (IS_WEB || !uri || uri.startsWith('sample:')) return;
  try {
    if (!uri) return;
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // ignore — best effort cleanup
  }
}

/** Web only: trigger a browser download of an image. */
export function downloadOnWeb(uri: string, filename: string) {
  if (!IS_WEB || typeof document === 'undefined') return;
  const a = document.createElement('a');
  a.href = uri;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
}
