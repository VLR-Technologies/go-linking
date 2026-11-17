import test from 'node:test';
import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { randomBytes } from 'node:crypto';
import {
  LocalBrandRepository,
  ReadOnlySeedRepository,
} from '../src/lib/product/local-repository';
import { BrandService } from '../src/lib/product/service';
import { emptyBrand, renderBrand } from '../src/lib/product/model';
import { normalizeLink, validateInput } from '../src/lib/product/validation';
import { LocalAdminAuthProvider } from '../src/lib/product/local-auth';
import {
  inspectImage,
  LocalAssetStorage,
} from '../src/lib/product/local-assets';
import {
  paletteFromPixels,
  filenameSuggestion,
} from '../src/lib/product/color-suggestions';
import { seedBrands } from '../src/lib/product/seed';
import { brands } from '../src/config/brands';
import { getDestinationUrl } from '../src/config/brands';
const valid = () => ({
  ...emptyBrand(),
  name: 'ABC Hospital',
  slug: 'abc-hospital',
  industry: 'Healthcare',
  fallbackApproved: true,
  links: [
    {
      id: 'website',
      brandId: '',
      type: 'website' as const,
      label: 'Website',
      description: 'Visit us',
      url: 'https://example.com',
      icon: 'website' as const,
      enabled: true,
      sortOrder: 0,
    },
  ],
});
async function repository() {
  await mkdir(path.join(process.cwd(), '.npm-cache/product-qa'), {
    recursive: true,
  });
  const directory = await mkdtemp(
    path.join(process.cwd(), '.npm-cache/product-qa/store-'),
  );
  return { directory, repo: new LocalBrandRepository(directory) };
}
test('repository seeds once, persists through reload, CRUD and all publish states', async () => {
  const { repo, directory } = await repository();
  const service = new BrandService(repo);
  assert.equal((await repo.list()).length, 3);
  assert.equal((await repo.list()).length, 3);
  let b = await service.save(valid());
  assert.equal(b.status, 'draft');
  assert.equal(await service.published(b.slug), undefined);
  assert.equal((await new LocalBrandRepository(directory).list()).length, 4);
  b = await service.save({ ...b, tagline: 'Care connects' }, b.id);
  assert.equal(b.tagline, 'Care connects');
  await service.transition(b.id, 'published');
  assert.ok(await service.published(b.slug));
  assert.equal((await service.directory()).length, 4);
  await service.transition(b.id, 'draft');
  assert.equal(await service.published(b.slug), undefined);
  await service.transition(b.id, 'archived');
  assert.equal(await service.published(b.slug), undefined);
  assert.equal((await service.get(b.id))?.name, 'ABC Hospital');
});
test('atomic uniqueness across concurrent repository instances; stale edits rejected', async () => {
  const { repo, directory } = await repository();
  const a = new BrandService(repo),
    b = new BrandService(new LocalBrandRepository(directory));
  const result = await Promise.allSettled([a.save(valid()), b.save(valid())]);
  assert.equal(result.filter((r) => r.status === 'fulfilled').length, 1);
  const record = (await a.list()).find((b) => b.slug === 'abc-hospital')!;
  await a.save({ ...record, name: 'Updated' }, record.id);
  await assert.rejects(
    () => b.save({ ...record, name: 'Stale' }, record.id),
    /another window/,
  );
});
test('publish validation, reserved and duplicate slugs, unsafe input', async () => {
  const { repo } = await repository();
  const service = new BrandService(repo);
  for (const slug of ['admin', 'api', 'qr', 'assets', 'Bad Slug', '../bad'])
    await assert.rejects(() => service.save({ ...valid(), slug }));
  const b = await service.save({
    ...valid(),
    links: [],
    fallbackApproved: false,
  });
  await assert.rejects(
    () => service.transition(b.id, 'published'),
    /logo|link/,
  );
  await assert.rejects(
    () => service.save({ ...valid(), slug: 'mozza-italia' }),
    /already/,
  );
  assert.throws(() => validateInput({ ...valid(), primaryColor: 'red' }));
  assert.throws(() =>
    validateInput({ ...valid(), logo: 'https://untrusted.test/logo.svg' }),
  );
});
test('published slug changes require confirmation; directory visibility respected', async () => {
  const { repo } = await repository();
  const service = new BrandService(repo);
  let b = await service.save(valid());
  b = await service.transition(b.id, 'published');
  await assert.rejects(
    () => service.save({ ...b, slug: 'new-slug' }, b.id),
    /printed/,
  );
  b = await service.save(
    { ...b, slug: 'new-slug', directoryVisible: false },
    b.id,
    true,
  );
  assert.ok(await service.published('new-slug'));
  assert.equal(await service.published('abc-hospital'), undefined);
  assert.equal((await service.directory()).length, 3);
});
test('corrupt stores fail safely without reseeding or overwriting', async () => {
  const { repo, directory } = await repository();
  await repo.list();
  await writeFile(path.join(directory, 'brands.json'), 'broken');
  await assert.rejects(() => repo.list());
  await assert.rejects(() => repo.transact(() => null));
  assert.equal(
    await readFile(path.join(directory, 'brands.json'), 'utf8'),
    'broken',
  );
});
test('seed presentation preserves every existing brand field and exact link URL', () => {
  const seeds = seedBrands();
  for (let i = 0; i < brands.length; i++) {
    const actual = renderBrand(seeds[i]);
    assert.deepEqual(actual.theme, brands[i].theme);
    assert.deepEqual(actual.copy, brands[i].copy);
    assert.equal(actual.logo, brands[i].logo);
    assert.deepEqual(
      actual.links.map((l) => l.url),
      brands[i].links.map((l) => l.url),
    );
  }
});
test('dynamic rendered brands resolve exact external targets for QR, copy and redirects', () => {
  const record = renderBrand(
    seedBrands().find((brand) => brand.slug === 'mozza-italia')!,
  );
  assert.equal(
    getDestinationUrl(record, 'website'),
    'https://www.mozzaitalia.com',
  );
  assert.equal(
    getDestinationUrl(record, 'review'),
    'https://g.page/r/CbxmdpzE3rO4EBM/review',
  );
  assert.equal(
    getDestinationUrl(record, 'instagram'),
    'https://www.instagram.com/italia.mozza',
  );
  assert.equal(getDestinationUrl(record, 'whatsapp'), brands[0].links[3].url);

  const dynamicRecord = validateInput({
    ...valid(),
    name: 'Mozza Italia QA',
    slug: 'mozza-italia-qa',
    links: [
      {
        ...valid().links[0],
        url: 'https://www.mozzaitalia.com/menu?source=qr&offer=summer%2Fmenu',
      },
    ],
  });
  const dynamicBrand = renderBrand(dynamicRecord);
  assert.equal(
    getDestinationUrl(dynamicBrand, 'website'),
    'https://www.mozzaitalia.com/menu?source=qr&offer=summer%2Fmenu',
  );
});
test('safe URL normalization supports HTTP(S), phone, email and WhatsApp', () => {
  assert.equal(
    normalizeLink('website', 'http://example.com'),
    'http://example.com',
  );
  assert.equal(normalizeLink('call', '+91 98765 43210'), 'tel:+919876543210');
  assert.equal(
    normalizeLink('email', 'hello@example.com'),
    'mailto:hello@example.com',
  );
  assert.equal(
    normalizeLink('whatsapp', '+91 98765 43210'),
    'https://wa.me/919876543210',
  );
  assert.equal(
    normalizeLink(
      'whatsapp',
      'https://api.whatsapp.com/send?phone=919876543210&text=Hi',
    ),
    'https://api.whatsapp.com/send?phone=919876543210&text=Hi',
  );
  const exactWhatsApp =
    'https://wa.me/919876543210/?text=Hi%20there%2C%20book%20a%20table&source=qr';
  assert.equal(normalizeLink('whatsapp', exactWhatsApp), exactWhatsApp);
  for (const url of [
    'javascript:alert(1)',
    'data:text/html,x',
    'file:///test',
    'vbscript:x',
    'https://user:pass@example.com',
  ])
    assert.throws(() => normalizeLink('custom', url));
  for (const url of [
    'https://localhost:3000',
    'http://127.0.0.1/',
    'https://192.168.1.20/',
    'https://10.0.0.2/',
    'https://[::1]/',
  ])
    assert.throws(() => normalizeLink('website', url));
  assert.throws(() => normalizeLink('instagram', 'https://notinstagram.com'));
  assert.throws(() => normalizeLink('email', 'bad@example.com?subject=test'));
});
test('local auth validates credentials, tampering, expiry, logout and production fail closed', async () => {
  const settings = {
    mode: 'development',
    username: 'qa',
    password: randomBytes(16).toString('hex'),
    secret: randomBytes(32).toString('hex'),
  };
  const auth = new LocalAdminAuthProvider(settings);
  assert.equal(await auth.login('qa', 'wrong'), null);
  const token = await auth.login('qa', settings.password);
  assert.ok(token);
  assert.equal(await auth.verify(token), true);
  assert.equal(await auth.verify(token + 'x'), false);
  assert.equal(await auth.verify(undefined), false);
  await auth.logout(token);
  assert.equal(await auth.verify(token), false);
  const real = Date.now;
  Date.now = () => real() - 9 * 60 * 60 * 1000;
  const expired = await auth.login('qa', settings.password);
  Date.now = real;
  assert.equal(await auth.verify(expired!), false);
  const production = new LocalAdminAuthProvider({
    ...settings,
    mode: 'production',
  });
  assert.equal(production.available(), false);
  assert.equal(await production.login('qa', settings.password), null);
  assert.equal(await production.verify(token), false);
  assert.equal(
    new LocalAdminAuthProvider({ ...settings, secret: '' }).available(),
    false,
  );
});
test('production repository is read-only', async () => {
  const repo = new ReadOnlySeedRepository();
  assert.equal((await repo.list()).length, 3);
  await assert.rejects(() => repo.transact(), /disabled/);
});
test('logout revocation persists across provider reloads', async () => {
  const { directory } = await repository();
  const settings = {
    mode: 'development',
    username: 'qa',
    password: randomBytes(16).toString('hex'),
    secret: randomBytes(32).toString('hex'),
  };
  const auth = new LocalAdminAuthProvider(settings, directory);
  const token = await auth.login('qa', settings.password);
  await auth.logout(token!);
  assert.equal(
    await new LocalAdminAuthProvider(settings, directory).verify(token!),
    false,
  );
});
test('uploads validate real raster headers, reject SVG/malformed/oversize and prevent path traversal', async () => {
  const png = await readFile('public/brands/vlr/logo.png');
  assert.equal(inspectImage(png, 'image/png', 'logo.png'), 'png');
  for (const bytes of [
    Buffer.from('<svg><script>alert(1)</script></svg>'),
    Buffer.from('not an image'),
    png.subarray(0, 30),
    Buffer.alloc(4 * 1024 * 1024),
  ])
    assert.throws(() => inspectImage(bytes, 'image/png', 'logo.png'));
  assert.throws(() => inspectImage(png, 'image/svg+xml', 'logo.svg'));
  const { directory } = await repository();
  const storage = new LocalAssetStorage(directory);
  const url = await storage.save(png, 'png');
  assert.deepEqual((await storage.read(url.split('/').at(-1)!))?.bytes, png);
  assert.equal(await storage.read('../brands.json'), undefined);
});
test('local palette extraction and filename suggestions do not fabricate business details', () => {
  const colors = paletteFromPixels(
    new Uint8ClampedArray([
      32, 96, 160, 255, 32, 96, 160, 255, 255, 255, 255, 255, 255, 0, 0, 0,
    ]),
  );
  assert.equal(colors.primaryColor, '#2060a0');
  assert.equal(filenameSuggestion('abc-elevators-logo.png'), 'Abc Elevators');
});
