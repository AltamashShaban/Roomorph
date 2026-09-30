import { Directory, File, Paths } from 'expo-file-system';
import { ImageManipulator, SaveFormat } from 'expo-image-manipulator';

export const MAX_EDGE = 1536;

export type PreparedImage = { uri: string; width: number; height: number };

/** Resize so the long edge is ≤ 1536px and re-encode as JPEG. */
export async function prepareImage(uri: string, width: number, height: number): Promise<PreparedImage> {
  const longEdge = Math.max(width, height);
  const ctx = ImageManipulator.manipulate(uri);
  if (longEdge > MAX_EDGE) {
    if (width >= height) ctx.resize({ width: MAX_EDGE });
    else ctx.resize({ height: MAX_EDGE });
  }
  const rendered = await ctx.renderAsync();
  const result = await rendered.saveAsync({ format: SaveFormat.JPEG, compress: 0.82 });
  return { uri: result.uri, width: result.width, height: result.height };
}

function photosDir() {
  const dir = new Directory(Paths.document, 'redesigns');
  if (!dir.exists) dir.create({ intermediates: true });
  return dir;
}

/** Copy a (cache) image into permanent app storage so history survives restarts. */
export function persistImage(uri: string, name: string) {
  const target = new File(photosDir(), name);
  if (target.exists) target.delete();
  new File(uri).copy(target);
  return target.uri;
}

export function writeBase64Image(base64: string, name: string) {
  const file = new File(photosDir(), name);
  if (file.exists) file.delete();
  file.create();
  file.write(base64, { encoding: 'base64' });
  return file.uri;
}

export async function readBase64(uri: string) {
  return new File(uri).base64();
}

export function deleteImage(uri?: string) {
  try {
    if (!uri) return;
    const f = new File(uri);
    if (f.exists) f.delete();
  } catch {
    // ignore — best effort cleanup
  }
}
