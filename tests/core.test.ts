import { test } from 'node:test';
import assert from 'node:assert/strict';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import {
  brands,
  getBrand,
  getDestination,
  getDestinationUrl,
  isUsableDestination,
  validateBrands,
} from '../src/config/brands';
import { qrDataUrl } from '../src/lib/qr';
import { getPublicBrandUrl, hubPath, siteSettings } from '../src/lib/site';
const development = { nodeEnv: 'development' };
const production = { nodeEnv: 'production', vercelEnv: 'production' };
const preview = { nodeEnv: 'production', vercelEnv: 'preview' };
const publicMaster = 'https://go-linking.vercel.app/mozza-italia';
const expected = [
  'https://g.page/r/CbxmdpzE3rO4EBM/review',
  'https://www.mozzaitalia.com',
  'https://www.instagram.com/italia.mozza',
  'https://wa.me/919949799488?text=Hi%20Mozza%20Italia%2C%20I%20would%20like%20to%20place%20an%20order.',
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
  assert.deepEqual(
    brand.links.map((link) => link.kind),
    ['review', 'website', 'instagram', 'whatsapp'],
  );
  const whatsapp = new URL(brand.links[3].url);
  assert.equal(whatsapp.pathname, '/919949799488');
  assert.equal(
    whatsapp.searchParams.get('text'),
    'Hi Mozza Italia, I would like to place an order.',
  );
  assert.equal(hubPath(brand.slug), '/mozza-italia');
});
test('unknown destinations and brands cannot redirect', () => {
  assert.equal(getDestination(brands[0], 'https://evil.example'), undefined);
  assert.equal(getDestination(brands[0], '__proto__'), undefined);
  assert.equal(getBrand('missing'), undefined);
  for (const id of [
    'https://evil.example',
    '__proto__',
    'missing',
    '//evil.com',
  ])
    assert.equal(getDestinationUrl(brands[0], id), undefined);
  for (const slug of ['//evil.com', '../mozza-italia', 'mozza-italia?next=x'])
    assert.throws(() => getPublicBrandUrl(slug));
});
test('destination resolver preserves supported web, phone and email link types', () => {
  const brand = structuredClone(brands[0]);
  for (const url of [
    'http://business.example.com/menu?day=friday',
    'mailto:hello@business.example.com',
    'tel:+919949799488',
  ]) {
    brand.links[0].url = url;
    assert.equal(isUsableDestination(brand.links[0]), true);
    assert.equal(getDestinationUrl(brand, brand.links[0].id), url);
  }
  for (const url of [
    'http://localhost:3000',
    'https://192.168.1.20',
    'http://[::1]',
    'javascript:alert(1)',
  ]) {
    brand.links[0].url = url;
    assert.equal(isUsableDestination(brand.links[0]), false);
    assert.equal(getDestinationUrl(brand, brand.links[0].id), undefined);
  }
});
test('unsafe configuration is rejected', () => {
  for (const url of [
    'javascript:alert(1)',
    'http://example.com',
    'https://user:password@example.com',
    'https://localhost:3000',
    'https://localhost.',
    'https://localhost..',
    'https://printer.localhost.',
    'https://127.1',
    'https://192.168.1.10',
    'https://[::1]',
    '//www.mozzaitalia.com',
    '/mozza-italia/website',
    'https://www.mozzaitalia.com\n',
    'https://www.mozzaitalia.com\\@localhost',
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
    assert.equal(siteSettings(value, development).downloadableMaster, false);
  for (const value of [
    'javascript:alert(1)',
    'https://host.com/path',
    'https://user:pass@host.com',
    'https://host.com/?q=x',
    'https://host.com/#fragment',
    'not a URL',
    'https://host.com\n',
  ])
    assert.throws(() => siteSettings(value, development));
  assert.equal(
    siteSettings('https://links.vlrtechnologies.net').downloadableMaster,
    true,
  );
});

test('production and Vercel preview default to the canonical public origin', () => {
  for (const environment of [
    production,
    preview,
    { nodeEnv: 'production' },
    { nodeEnv: 'development', vercelEnv: 'preview' },
    { nodeEnv: 'development', vercelEnv: 'production' },
    {},
  ]) {
    const settings = siteSettings('', environment);
    assert.equal(getPublicBrandUrl('mozza-italia', settings), publicMaster);
    assert.equal(settings.downloadableMaster, true);
    assert.equal(
      getPublicBrandUrl(
        'mozza-italia',
        siteSettings('https://go-linking.vercel.app', environment),
      ),
      publicMaster,
    );
    for (const value of [
      'http://localhost:3000',
      'https://localhost',
      'https://localhost.',
      'https://localhost..',
      'https://127.0.0.1',
      'https://10.0.0.1',
      'https://[::1]',
      'https://printer.local',
      'https://example.com',
      'http://go-linking.vercel.app',
    ])
      assert.throws(
        () => siteSettings(value, environment),
        /public HTTPS origin/,
      );
  }
  assert.equal(
    getPublicBrandUrl('dynamic-client', siteSettings('', production)),
    'https://go-linking.vercel.app/dynamic-client',
  );
});

test('local development supports its own origin without affecting external destinations', () => {
  for (const value of ['', 'http://localhost:3000', 'http://localhost:3200']) {
    const settings = siteSettings(value, development);
    assert.equal(settings.origin, value || 'http://localhost:3000');
    assert.equal(settings.downloadableMaster, false);
    assert.equal(
      getPublicBrandUrl('mozza-italia', settings),
      `${settings.origin}/mozza-italia`,
    );
    assert.equal(
      getDestinationUrl(brands[0], 'website'),
      'https://www.mozzaitalia.com',
    );
  }
});

test('every destination resolver preserves the exact configured URL bytes', () => {
  for (const [index, link] of brands[0].links.entries())
    assert.equal(getDestinationUrl(brands[0], link.id), expected[index]);
  const futureBrand = structuredClone(brands[0]);
  const exact =
    'https://business.com/Order/%2f?text=Hi%20there%2C%20please%21&ref=A%2bB#menu';
  futureBrand.links[0].url = exact;
  validateBrands([futureBrand]);
  assert.equal(getDestinationUrl(futureBrand, 'review'), exact);
  futureBrand.links[0].disabled = true;
  assert.equal(getDestinationUrl(futureBrand, 'review'), undefined);
});

for (const url of [
  getPublicBrandUrl('mozza-italia', siteSettings('', development)),
  getPublicBrandUrl('mozza-italia', siteSettings('', production)),
  ...brands[0].links.map((link) => getDestinationUrl(brands[0], link.id)!),
]) {
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

test('all three brands register and placeholders expose no destinations', () => {
  assert.deepEqual(
    brands.map((brand) => brand.slug),
    ['mozza-italia', 'elevator-company', 'tuition-classes'],
  );
  for (const brand of brands.slice(1)) {
    assert.equal(brand.placeholder, true);
    for (const link of brand.links) {
      assert.equal(link.url, '');
      assert.equal(getDestination(brand, link.id), undefined);
      assert.equal(getDestinationUrl(brand, link.id), undefined);
    }
  }
});

test('configured client links can be enabled while unsafe and duplicate entries are rejected', () => {
  const items = structuredClone(brands);
  const link = items[1].links[2];
  link.disabled = false;
  link.url = 'tel:+919000000000';
  validateBrands(items);
  assert.equal(getDestination(items[1], link.id)?.url, link.url);
  link.url = 'javascript:alert(1)';
  assert.throws(() => validateBrands(items));
  link.url = '';
  items[1].links[1].id = items[1].links[0].id;
  assert.throws(() => validateBrands(items));
});
