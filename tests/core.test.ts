import { test } from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import {
  brands,
  getBrand,
  getDestination,
  validateBrands,
} from '../src/config/brands';
import { qrDataUrl } from '../src/lib/qr';
import { hubPath, siteSettings } from '../src/lib/site';
const expected = [
  'https://www.mozzaitalia.com',
  'https://www.instagram.com/italia.mozza/',
  'https://g.page/r/CbxmdpzE3rO4EBM/review',
];
test('brand has required values and exact approved URLs', () => {
  validateBrands(brands);
  const brand = getBrand('mozza-italia')!;
  assert.equal(brand.name, 'Mozza Italia');
  assert.equal(brand.tagline, 'Taste Brings People Together');
  assert.equal(brand.logo, '/brands/mozza-italia/logo.png');
  assert.deepEqual(
    brand.links.map((link) => link.url),
    expected,
  );
  assert.equal(hubPath(brand.slug), '/mozza-italia');
});
test('unknown destinations and brands cannot redirect', () => {
  assert.equal(getDestination(brands[0], 'https://evil.example'), undefined);
  assert.equal(getDestination(brands[0], '__proto__'), undefined);
  assert.equal(getBrand('missing'), undefined);
});
test('unsafe configuration is rejected', () => {
  for (const url of [
    'javascript:alert(1)',
    'http://example.com',
    'https://user:password@example.com',
  ]) {
    const copy = structuredClone(brands);
    copy[0].links[0].url = url;
    assert.throws(() => validateBrands(copy));
  }
});
test('master origin accepts only clean HTTP(S) origins and protects preview downloads', () => {
  for (const value of [
    'http://localhost:3000',
    'https://localhost',
    'https://192.168.1.10',
    'https://example.com',
    'https://demo.test',
    'http://public-domain.com',
  ])
    assert.equal(siteSettings(value).downloadableMaster, false);
  for (const value of [
    'javascript:alert(1)',
    'https://host.com/path',
    'https://user:pass@host.com',
    'https://host.com/?q=x',
  ])
    assert.throws(() => siteSettings(value));
  assert.equal(
    siteSettings('https://links.vlrtechnologies.net').downloadableMaster,
    true,
  );
});
for (const url of ['http://localhost:3000/mozza-italia', ...expected]) {
  for (const size of [200, 250, 300, 1024])
    test(`QR decodes exactly at ${size}px: ${url}`, async () => {
      const data = await qrDataUrl(url, size);
      const png = PNG.sync.read(Buffer.from(data.split(',')[1], 'base64'));
      const decoded = jsQR(
        new Uint8ClampedArray(png.data),
        png.width,
        png.height,
      );
      assert.equal(decoded?.data, url);
      assert.equal(png.width, size);
      assert.deepEqual(
        Array.from(png.data.subarray(0, 4)),
        [255, 255, 255, 255],
      );
    });
}
