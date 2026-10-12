import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import jsQR from 'jsqr';
import { PNG } from 'pngjs';
import { brands } from '../../src/config/brands';

for (const width of [390, 430, 768, 1024, 1280, 1440]) {
  for (const path of ['/', ...brands.map((brand) => `/${brand.slug}`)]) {
    test(`${path} responsive and accessible at ${width}`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });
      await page.emulateMedia({ reducedMotion: 'reduce' });
      await page.goto(path);
      await page.evaluate(() => document.fonts.ready);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      for (const control of await page.locator('.card-action').all()) {
        const box = (await control.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(path === '/' ? 44 : 28);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
      if (path === '/mozza-italia') {
        await expect(page.locator('.copy-links')).toHaveCount(0);
        await expect(page.locator('.destination-card')).toHaveCount(4);
        await expect(page.locator('h1')).toHaveText('MORE MOZZA.ONE TAP AWAY.');
        await expect(page.locator('.brand-logo')).toHaveAttribute(
          'src',
          brands[0].logo,
        );
        await expect(page.locator('.food-piece:visible')).toHaveCount(
          width < 768 ? 3 : 6,
        );
      }
      await page.screenshot({
        path: `test-results/after-${path.replaceAll('/', '') || 'directory'}-${width}.png`,
        fullPage: true,
      });
    });
  }
}

async function decode(source: string) {
  const png = PNG.sync.read(Buffer.from(source.split(',')[1], 'base64'));
  return jsQR(new Uint8ClampedArray(png.data), png.width, png.height)?.data;
}

for (const width of [390, 1280]) {
  test(`all card actions, decoded QRs, downloads and focus at ${width}`, async ({
    page,
    context,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    await page.goto('/mozza-italia');
    for (const link of brands[0].links) {
      const openPagesBeforeCopy = context.pages().length;
      const row = page.locator('.destination-card').filter({
        has: page.getByRole('heading', { name: link.title, exact: true }),
      });
      await row
        .getByRole('button', { name: `Copy ${link.title} link`, exact: true })
        .click();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        link.url,
      );
      await expect(row.getByRole('status').first()).toHaveText(
        `${link.title} link copied`,
      );
      await expect(page).toHaveURL('/mozza-italia');
      expect(context.pages()).toHaveLength(openPagesBeforeCopy);
      const qrButton = row.getByRole('button', {
        name: `QR for ${link.title}`,
        exact: true,
      });
      await qrButton.click();
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();
      await expect(
        dialog.getByRole('button', { name: 'Close QR dialog' }),
      ).toBeFocused();
      await expect(dialog.locator('.modal-qr')).toBeVisible();
      expect(
        await decode((await dialog.locator('.modal-qr').getAttribute('src'))!),
      ).toBe(link.url);
      await page.keyboard.press('Shift+Tab');
      expect(
        await page.evaluate(() =>
          document
            .querySelector('dialog[open]')
            ?.contains(document.activeElement),
        ),
      ).toBe(true);
      const download = page.waitForEvent('download');
      await dialog.getByRole('link', { name: 'Download QR' }).click();
      expect((await download).suggestedFilename()).toBe(`${link.id}-qr.png`);
      await dialog
        .getByRole('button', { name: 'Copy Link', exact: true })
        .click();
      expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
        link.url,
      );
      expect(
        (
          await new AxeBuilder({ page })
            .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
            .analyze()
        ).violations,
      ).toEqual([]);
      await page.keyboard.press('Escape');
      await expect(dialog).toHaveCount(0);
      await expect(qrButton).toBeFocused();
      await expect(
        row.getByRole('link', { name: link.cta, exact: true }),
      ).toHaveAttribute('href', link.url);
      await expect(
        row.getByRole('link', { name: link.cta, exact: true }),
      ).not.toHaveAttribute('target');
    }
    await expect(page.locator('.link-toast')).toHaveCount(0, { timeout: 4000 });
  });
}

test('directory master actions and internal navigation', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const brand of brands) {
    await page.goto('/');
    const row = page.locator('.company-card').filter({
      has: page.getByRole('heading', { name: brand.name, exact: true }),
    });
    await row
      .getByRole('button', { name: `Copy ${brand.name} link`, exact: true })
      .click();
    await expect(page).toHaveURL('/');
    const expected = `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${brand.slug}`;
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      expected,
    );
    await row
      .getByRole('button', { name: `QR for ${brand.name}`, exact: true })
      .click();
    const dialog = page.getByRole('dialog');
    await expect(page).toHaveURL('/');
    await expect(dialog.locator('.modal-qr')).toBeVisible();
    expect(
      await decode((await dialog.locator('.modal-qr').getAttribute('src'))!),
    ).toBe(expected);
    await expect(dialog.getByText(/Preview only/)).toBeVisible();
    await expect(dialog.getByRole('link', { name: 'Download QR' })).toHaveCount(
      0,
    );
    await dialog.getByRole('button', { name: 'Close QR dialog' }).click();
    await row
      .getByRole('link', { name: `Open ${brand.name}`, exact: true })
      .click();
    await expect(page).toHaveURL(`/${brand.slug}`);
  }
});

test('placeholder destinations cannot be opened and use distinct scenes', async ({
  page,
  request,
}) => {
  for (const brand of brands.slice(1)) {
    await page.goto(`/${brand.slug}`);
    await expect(page.locator('.placeholder-notice')).toBeVisible();
    await expect(page.locator('.food-scene,.card-actions')).toHaveCount(0);
    await expect(page.locator('.destination-card[data-disabled]')).toHaveCount(
      brand.links.length,
    );
    await expect(
      page.locator('.destination-card a, .destination-card button'),
    ).toHaveCount(0);
    await expect(page.locator('.destination-card .icon-badge svg')).toHaveCount(
      brand.links.length,
    );
    await expect(page.locator(`.${brand.experience}-scene`)).toHaveCount(1);
    await page.emulateMedia({ reducedMotion: 'reduce' });
    expect(
      await page
        .locator('.brand-animation')
        .evaluate((el) => el.getAnimations({ subtree: true }).length),
    ).toBe(0);
    for (const link of brand.links)
      expect((await request.get(`/${brand.slug}/${link.id}`)).status()).toBe(
        404,
      );
    await page.goto(`/qr/${brand.slug}`);
    await expect(page.locator('.qr-image')).toHaveCount(1);
  }
});

for (const mode of ['denied', 'unavailable'])
  test(`clipboard ${mode} offers manual fallback`, async ({ page }) => {
    await page.goto('/mozza-italia');
    await page.evaluate(
      (mode) =>
        Object.defineProperty(navigator, 'clipboard', {
          value:
            mode === 'unavailable'
              ? undefined
              : { writeText: () => Promise.reject(new Error('Denied')) },
          configurable: true,
        }),
      mode,
    );
    await page
      .getByRole('button', { name: 'Copy Website link', exact: true })
      .click();
    const input = page.getByRole('textbox', {
      name: 'Website link to copy manually',
    });
    await expect(input).toHaveValue(brands[0].links[1].url);
    await input.focus();
    expect(
      await input.evaluate(
        (el: HTMLInputElement) => el.selectionEnd! - el.selectionStart!,
      ),
    ).toBe(brands[0].links[1].url.length);
    await page.keyboard.press('Escape');
    await expect(
      page.getByRole('button', { name: 'Copy Website link', exact: true }),
    ).toBeFocused();
  });

test('same-tab navigation works with and without JavaScript', async ({
  browser,
  baseURL,
}) => {
  for (const javaScriptEnabled of [true, false]) {
    const context = await browser.newContext({ javaScriptEnabled, baseURL });
    const page = await context.newPage();
    for (const link of brands[0].links) {
      await context.route(new URL(link.url).href, (route) =>
        route.fulfill({ body: 'Verified destination' }),
      );
      await page.goto('/mozza-italia');
      await page.getByRole('link', { name: link.cta, exact: true }).click();
      await expect(page).toHaveURL(new URL(link.url).href);
      expect(context.pages()).toHaveLength(1);
    }
    await context.close();
  }
});
