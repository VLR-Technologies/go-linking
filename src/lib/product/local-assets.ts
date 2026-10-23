import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { AssetStorage } from './contracts';
import { ProductError } from './validation';
export const maxUpload = 3 * 1024 * 1024;
export function inspectImage(bytes: Buffer, mime: string, name: string) {
  if (!bytes.length || bytes.length > maxUpload)
    throw new ProductError('Logo must be under 3 MB.');
  let width = 0,
    height = 0,
    extension = '';
  if (
    mime === 'image/png' &&
    /\.png$/i.test(name) &&
    bytes
      .subarray(0, 8)
      .equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])) &&
    bytes.length >= 45
  ) {
    let offset = 8,
      ended = false;
    while (offset + 12 <= bytes.length) {
      const length = bytes.readUInt32BE(offset),
        kind = bytes.toString('ascii', offset + 4, offset + 8);
      if (offset + length + 12 > bytes.length) break;
      if (offset === 8 && kind === 'IHDR' && length === 13) {
        width = bytes.readUInt32BE(offset + 8);
        height = bytes.readUInt32BE(offset + 12);
      }
      offset += length + 12;
      if (kind === 'IEND') {
        ended = true;
        break;
      }
    }
    if (!ended) throw new ProductError('Invalid PNG file.');
    extension = 'png';
  } else if (
    mime === 'image/jpeg' &&
    /\.jpe?g$/i.test(name) &&
    bytes[0] === 255 &&
    bytes[1] === 216 &&
    bytes.at(-2) === 255 &&
    bytes.at(-1) === 217
  ) {
    for (let p = 2; p + 9 < bytes.length;) {
      if (bytes[p] !== 255) break;
      const marker = bytes[p + 1],
        length = bytes.readUInt16BE(p + 2);
      if (length < 2 || p + 2 + length > bytes.length) break;
      if ([192, 193, 194].includes(marker)) {
        height = bytes.readUInt16BE(p + 5);
        width = bytes.readUInt16BE(p + 7);
        break;
      }
      p += length + 2;
    }
    extension = 'jpg';
  } else if (
    mime === 'image/webp' &&
    /\.webp$/i.test(name) &&
    bytes.length >= 30 &&
    bytes.toString('ascii', 0, 4) === 'RIFF' &&
    bytes.toString('ascii', 8, 12) === 'WEBP' &&
    bytes.readUInt32LE(4) + 8 === bytes.length
  ) {
    const kind = bytes.toString('ascii', 12, 16);
    if (kind === 'VP8X') {
      width = 1 + bytes.readUIntLE(24, 3);
      height = 1 + bytes.readUIntLE(27, 3);
    } else if (kind === 'VP8 ' && bytes.length >= 30) {
      width = bytes.readUInt16LE(26) & 0x3fff;
      height = bytes.readUInt16LE(28) & 0x3fff;
    } else if (kind === 'VP8L' && bytes[20] === 47) {
      const bits = bytes.readUInt32LE(21);
      width = (bits & 0x3fff) + 1;
      height = ((bits >>> 14) & 0x3fff) + 1;
    }
    extension = 'webp';
  }
  if (
    !extension ||
    width < 1 ||
    height < 1 ||
    width > 6000 ||
    height > 6000 ||
    width * height > 16000000
  )
    throw new ProductError(
      'Use a valid PNG, JPEG or WebP image up to 6000px and 16 megapixels. SVG uploads are not supported.',
    );
  return extension;
}
export class LocalAssetStorage implements AssetStorage {
  constructor(private directory: string) {}
  async save(bytes: Buffer, extension: string) {
    if (!['png', 'jpg', 'webp'].includes(extension))
      throw new ProductError('Invalid image format.');
    await mkdir(this.directory, { recursive: true });
    const id = `${randomUUID()}.${extension}`;
    await writeFile(
      path.join(/* turbopackIgnore: true */ this.directory, id),
      bytes,
      {
        flag: 'wx',
        mode: 0o600,
      },
    );
    return `/api/assets/${id}`;
  }
  async read(id: string) {
    if (!/^[a-f0-9-]+\.(png|jpg|webp)$/.test(id)) return undefined;
    try {
      return {
        bytes: await readFile(path.join(this.directory, id)),
        contentType: id.endsWith('.png')
          ? 'image/png'
          : id.endsWith('.jpg')
            ? 'image/jpeg'
            : 'image/webp',
      };
    } catch {
      return undefined;
    }
  }
}
