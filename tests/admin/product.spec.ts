import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { PNG } from 'pngjs';
import jsQR from 'jsqr';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
const origin = 'http://localhost:3116';
test.beforeAll(async () => {
  await mkdir(path.join(process.cwd(), '.npm-cache/product-qa'), {
    recursive: true,
  });
});
function decodeQr(source: string) {
  const png = PNG.sync.read(Buffer.from(source.split(',')[1], 'base64'));
  return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
}
async function login(page: import('@playwright/test').Page) {
  await page.goto('/admin/login');
  await page
    .getByLabel('Username', { exact: true })
    .fill(process.env.GO_LINKING_ADMIN_USERNAME!);
  await page
    .getByLabel('Password', { exact: true })
    .fill(process.env.GO_LINKING_ADMIN_PASSWORD!);
  await page.getByRole('button', { name: 'Sign in →', exact: true }).click();
  await expect(
    page.getByRole('heading', { name: 'A home for every brand.' }),
  ).toBeVisible();
}
test('auth protection, invalid login, cookie flags, unauthorized writes, logout', async ({
  page,
  request,
}) => {
  expect(
    (
      await request.post('/api/admin/brands', {
        data: {},
        headers: { Origin: origin },
      })
    ).status(),
  ).toBe(401);
  await page.goto('/admin/brands');
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.getByLabel('Username', { exact: true }).fill('wrong');
  await page.getByLabel('Password', { exact: true }).fill('wrong-password');
  await page.getByRole('button', { name: 'Sign in →', exact: true }).click();
  await expect(page.locator('.admin-error[role=alert]')).toHaveText(
    'Invalid credentials.',
  );
  await login(page);
  const cookie = (await page.context().cookies()).find(
    (c) => c.name === 'go-linking-admin',
  )!;
  expect(cookie.httpOnly).toBe(true);
  expect(cookie.sameSite).toBe('Strict');
  expect(
    (
      await page.request.post('/api/admin/brands', {
        data: {},
        headers: { Origin: 'https://evil.example' },
      })
    ).status(),
  ).toBe(403);
  await page.getByRole('button', { name: 'Sign Out ↗' }).click();
  await expect(page).toHaveURL(/\/admin\/login/);
  await page.context().addCookies([cookie]);
  expect((await page.request.get('/api/admin/brands')).status()).toBe(401);
});
test('complete onboarding: upload, palette, links, live preview, persistence, publish, QR, unpublish, archive', async ({
  page,
  context,
  request,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await login(page);
  await page
    .getByRole('link', { name: '＋ Create New Brand', exact: true })
    .click();
  await page
    .getByRole('button', { name: 'Save draft', exact: true })
    .first()
    .click();
  await expect(page.locator('.admin-error[role=alert]')).toContainText(
    'Brand name',
  );
  const name = `QA Hospital ${Date.now()}`;
  await page.getByLabel('Brand name *', { exact: true }).fill(name);
  const slug = await page.getByLabel('Slug *', { exact: true }).inputValue();
  expect(slug).toMatch(/^qa-hospital-/);
  await page
    .getByLabel('Industry *', { exact: true })
    .selectOption('Healthcare');
  await page.getByLabel('Tagline', { exact: true }).fill('Care, connected.');
  await page.getByRole('button', { name: 'Next →', exact: true }).click();
  await page.getByLabel('Upload logo').setInputFiles({
    name: 'bad.svg',
    mimeType: 'image/svg+xml',
    buffer: Buffer.from('<svg/>'),
  });
  await expect(page.locator('.admin-error[role=alert]')).toContainText('PNG');
  await page
    .getByLabel('Upload logo')
    .setInputFiles('public/brands/vlr/logo.png');
  await expect(
    page.getByRole('heading', { name: 'Colors from your logo' }),
  ).toBeVisible();
  await page
    .getByRole('button', { name: 'Apply suggested palette and style' })
    .click();
  await page
    .getByRole('button', { name: 'Save draft', exact: true })
    .first()
    .click();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  const editURL = page.url();
  const savedBrand = await (
    await page.request.get('/api/admin/brands/' + editURL.split('/').at(-1))
  ).json();
  expect((await request.get(savedBrand.logo)).status()).toBe(404);
  await page.screenshot({
    path: '.npm-cache/product-qa/admin-branding.png',
    fullPage: true,
  });
  expect((await page.request.get(`/${slug}`)).status()).toBe(404);
  await page.getByRole('button', { name: 'Next →', exact: true }).click();
  await page.getByRole('button', { name: '＋ Add Link' }).click();
  const editors = page.locator('.link-editor');
  await editors
    .nth(0)
    .getByLabel('URL / phone / email')
    .fill('javascript:alert(1)');
  await expect(
    page.getByText('Only safe HTTP(S) URLs without credentials are allowed.'),
  ).toBeVisible();
  await editors
    .nth(0)
    .getByLabel('URL / phone / email')
    .fill('https://example.com/health');
  await editors
    .nth(0)
    .getByLabel('Description', { exact: true })
    .fill('Visit our website');
  await page.getByRole('button', { name: '＋ Add Link' }).click();
  await editors.nth(1).getByLabel('Link type').selectOption('whatsapp');
  await editors.nth(1).getByLabel('Label', { exact: true }).fill('WhatsApp');
  await editors
    .nth(1)
    .getByLabel('URL / phone / email')
    .fill('+91 98765 43210');
  await page.getByRole('button', { name: 'Move WhatsApp up' }).click();
  await page.screenshot({
    path: '.npm-cache/product-qa/admin-links.png',
    fullPage: true,
  });
  await expect(editors.nth(0).getByLabel('Label', { exact: true })).toHaveValue(
    'WhatsApp',
  );
  await page.getByRole('button', { name: 'Next →', exact: true }).click();
  await page
    .getByLabel('Animation preset', { exact: true })
    .selectOption('healthcare');
  await page
    .getByLabel('Hero heading', { exact: true })
    .fill('Care within reach.');
  await page
    .getByRole('button', { name: 'Save draft', exact: true })
    .first()
    .click();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByLabel('Brand name *', { exact: true })).toHaveValue(
    name,
  );
  await page.getByRole('button', { name: '05 Preview', exact: true }).click();
  await expect(
    page
      .frameLocator('iframe')
      .getByRole('heading', { name: 'Care within reach.' }),
  ).toBeVisible();
  await page.getByRole('button', { name: 'Desktop · 1280' }).click();
  await expect(page.locator('iframe')).toHaveCSS('width', '1280px');
  await page.screenshot({
    path: '.npm-cache/product-qa/admin-live-preview.png',
    fullPage: true,
  });
  await page.getByRole('button', { name: 'Next →', exact: true }).click();
  await page.getByRole('button', { name: 'Publish Brand →' }).click();
  await expect(
    page.getByRole('heading', { name: 'Brand published.' }),
  ).toBeVisible();
  const master = page.locator('.admin-qr-asset').first();
  const image = await master.getByRole('img').getAttribute('src');
  expect(decodeQr(image!)).toBe(`${origin}/${slug}`);
  await master
    .getByRole('button', { name: `Copy ${name} master link` })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    `${origin}/${slug}`,
  );
  const published = await (
    await page.request.get('/api/admin/brands/' + editURL.split('/').at(-1))
  ).json();
  const website = published.links.find(
    (link: { label: string }) => link.label === 'Website',
  );
  if (!website) throw new Error('Published website link is missing');
  expect(website.url).toBe('https://example.com/health');
  const websiteAsset = page.locator('.admin-qr-asset').filter({
    has: page.getByRole('heading', { name: 'Website', exact: true }),
  });
  const websiteImage = await websiteAsset.getByRole('img').getAttribute('src');
  expect(decodeQr(websiteImage!)).toBe(website.url);
  await websiteAsset
    .getByRole('button', { name: 'Copy Website link', exact: true })
    .click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
    'https://example.com/health',
  );
  const redirect = await page.request.get(`/${slug}/${website.id}`, {
    maxRedirects: 0,
  });
  expect(redirect.status()).toBe(307);
  expect(redirect.headers().location).toBe(website.url);
  for (const format of ['PNG', 'SVG']) {
    const download = page.waitForEvent('download');
    await master.getByRole('link', { name: `Download ${format}` }).click();
    expect((await download).suggestedFilename()).toContain(
      format.toLowerCase(),
    );
  }
  expect((await request.get(savedBrand.logo)).status()).toBe(200);
  await page.screenshot({
    path: '.npm-cache/product-qa/admin-published.png',
    fullPage: true,
  });
  await page.goto(`/${slug}`);
  await expect(
    page.getByRole('heading', { name: 'Care within reach.' }),
  ).toBeVisible();
  await expect(page.locator('.destination-card').first()).toContainText(
    'WhatsApp',
  );
  await expect(
    page.getByRole('link', { name: 'Open WhatsApp', exact: true }),
  ).toHaveAttribute('href', 'https://wa.me/919876543210');
  const publicWebsite = page.getByRole('link', {
    name: 'Open Website',
    exact: true,
  });
  await expect(publicWebsite).toHaveAttribute('href', website.url);
  await page.route(website.url, (route) =>
    route.fulfill({ body: 'Verified configured destination' }),
  );
  await publicWebsite.click();
  await expect(page).toHaveURL(website.url);
  await page.goto(`/${slug}`);
  await page.goto('/');
  await expect(
    page.getByRole('link', { name: `Open ${name}`, exact: true }),
  ).toBeVisible();
  await page.goto(editURL);
  await page.getByLabel('Slug *', { exact: true }).fill(`${slug}-renamed`);
  page.once('dialog', (d) => d.dismiss());
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(
    page.getByText('Unsaved changes', { exact: true }),
  ).toBeVisible();
  page.once('dialog', (d) => d.accept());
  await page.getByRole('button', { name: 'Save changes', exact: true }).click();
  await expect(page.getByText('Saved', { exact: true })).toBeVisible();
  expect((await page.request.get(`/${slug}`)).status()).toBe(404);
  await page.goto('/admin/brands');
  const card = page
    .locator('.admin-brand-card')
    .filter({ has: page.getByRole('heading', { name, exact: true }) });
  page.once('dialog', (d) => d.accept());
  await card.getByRole('button', { name: 'Unpublish', exact: true }).click();
  await expect(card.locator('.status-badge')).toHaveText('draft');
  expect((await request.get(savedBrand.logo)).status()).toBe(404);
  expect((await page.request.get(`/${slug}-renamed`)).status()).toBe(404);
  page.once('dialog', (d) => d.accept());
  await card.getByRole('button', { name: 'Archive', exact: true }).click();
  await expect(card.locator('.status-badge')).toHaveText('archived');
});
test('server-side validation rejects duplicate slugs, unsafe links and malformed uploads', async ({
  page,
}) => {
  await login(page);
  const list = await (await page.request.get('/api/admin/brands')).json();
  const b = list[0];
  const duplicate = await page.request.post('/api/admin/brands', {
    headers: { Origin: origin },
    data: { ...b, id: '', logo: '', fallbackApproved: true },
  });
  expect(duplicate.status()).toBe(409);
  for (const url of [
    'javascript:x',
    'data:text/html,x',
    'file:///x',
    'http://localhost:3000',
    'https://127.0.0.1/',
    'https://192.168.1.20/',
    'https://[::1]/',
  ]) {
    const r = await page.request.post('/api/admin/brands', {
      headers: { Origin: origin },
      data: {
        ...b,
        id: '',
        slug: `unsafe-${Date.now()}`,
        logo: '',
        fallbackApproved: true,
        links: [{ ...b.links[0], url }],
      },
    });
    expect(r.status()).toBe(400);
  }
  const upload = await page.request.post('/api/admin/upload', {
    headers: {
      Origin: origin,
      'Content-Type': 'image/png',
      'X-Filename': 'logo.png',
    },
    data: Buffer.from('not a PNG'),
  });
  expect(upload.status()).toBe(400);
});
for (const width of [390, 430, 768, 1024, 1440])
  test(`admin responsive visual and accessibility QA at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto('/admin/login');
    await page
      .getByRole('button', { name: 'Show password', exact: true })
      .click();
    await page
      .getByRole('button', { name: 'Hide password', exact: true })
      .click();
    await page.screenshot({
      path: `.npm-cache/product-qa/login-${width}.png`,
      fullPage: true,
    });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await login(page);
    await page.screenshot({
      path: `.npm-cache/product-qa/dashboard-${width}.png`,
      fullPage: true,
    });
    await page.goto('/admin/brands/new');
    await expect(
      page.getByRole('heading', { name: 'Create a brand.' }),
    ).toBeVisible();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `.npm-cache/product-qa/wizard-${width}.png`,
      fullPage: true,
    });
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    if (width === 390) {
      await page
        .getByRole('button', { name: 'Toggle admin navigation' })
        .click();
      await expect(
        page.getByRole('navigation', { name: 'Admin navigation' }),
      ).toBeVisible();
    }
  });
