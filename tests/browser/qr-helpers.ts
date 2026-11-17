import { readFile } from 'node:fs/promises';
import type { Download } from '@playwright/test';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';

// Independent expectations: do not use the application resolver to calculate
// the expected payload, or a production-origin regression could pass unnoticed.
export const expectedBrandUrl = (slug: string) =>
  process.env.PLAYWRIGHT_SERVER_MODE === 'development'
    ? `http://localhost:${process.env.PLAYWRIGHT_PORT || '3000'}/${slug}`
    : `https://go-linking.vercel.app/${slug}`;
export const localMaster = process.env.PLAYWRIGHT_SERVER_MODE === 'development';

export function decodeQrPng(buffer: Buffer) {
  const png = PNG.sync.read(buffer);
  return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
}

export function decodeQrSource(source: string) {
  return decodeQrPng(Buffer.from(source.split(',')[1], 'base64'));
}

export async function decodeQrDownload(download: Download) {
  const path = await download.path();
  if (!path) throw new Error('QR download was not saved');
  return decodeQrPng(await readFile(path));
}
