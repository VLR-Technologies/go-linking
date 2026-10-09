import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { brands } from '../../src/config/brands';
const brand = brands[0];
test('intro auto-completes once per tab and does not replay on return', async ({
  page,
}) => {
  await page.goto('/mozza-italia');
  await expect(page.getByTestId('brand-intro')).toBeVisible();
  await expect(page.locator('.intro-brand')).toHaveCSS('opacity', '1');
  await page.screenshot({ path: 'test-results/intro.png' });
  await expect(page.getByTestId('brand-intro')).toHaveCount(0, {
    timeout: 5000,
  });
  await page.locator('a[href="/mozza-italia/website"]').click();
  await page.getByRole('link', { name: 'Back to Mozza Italia' }).click();
  await expect(page).toHaveURL('/mozza-italia');
  await expect(page.getByTestId('brand-intro')).toHaveCount(0);
  await page.reload();
  await expect(page.getByTestId('brand-intro')).toHaveCount(0);
});
test('intro can be skipped immediately', async ({ page }) => {
  await page.goto('/mozza-italia');
  await page.getByRole('button', { name: 'Skip intro' }).click();
  await expect(page.getByTestId('brand-intro')).toHaveCount(0);
  await page.locator('a[href="/mozza-italia/instagram"]').click();
  await expect(page).toHaveURL('/mozza-italia/instagram');
});
test('intro tolerates blocked storage and keyboard dismissal', async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, 'sessionStorage', {
      get() {
        throw new Error('Storage disabled');
      },
    }),
  );
  await page.goto('/mozza-italia');
  await expect(page.getByTestId('brand-intro')).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.getByTestId('brand-intro')).toHaveCount(0);
  await page.locator('a[href="/mozza-italia/website"]').click();
  await page.getByRole('link', { name: 'Back to Mozza Italia' }).click();
  await expect(page.getByTestId('brand-intro')).toHaveCount(0);
});
test('hub and destination links work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  await page.goto('/mozza-italia');
  await expect(page.getByTestId('brand-intro')).toHaveCount(0);
  await page.locator('a[href="/mozza-italia/website"]').click();
  await expect(
    page.getByRole('link', { name: 'Open Website' }),
  ).toHaveAttribute('href', brand.links[0].url);
  await context.close();
});
for (const width of [390, 430, 768, 1024, 1280, 1440]) {
  test(`routes fit and remain accessible at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const route of [
      '/',
      '/mozza-italia',
      ...brand.links.map((link) => `/mozza-italia/${link.id}`),
      '/qr/mozza-italia',
    ]) {
      await page.goto(route);
      await expect(page.locator('h1')).toBeVisible();
      if (route.startsWith('/mozza-italia')) {
        await expect(page.locator('.brand-shell .brand-logo')).toBeVisible();
      }
      await expect(page.getByTestId('brand-intro')).toHaveCount(0, {
        timeout: 5000,
      });
      await page.evaluate(async () => {
        await Promise.all(
          document.getAnimations().map((animation) => animation.finished),
        );
      });
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
      if (['/mozza-italia', '/mozza-italia/review'].includes(route)) {
        await page.screenshot({
          path: `test-results/${route.endsWith('review') ? 'review' : 'hub'}-${width}.png`,
          fullPage: true,
        });
      }
    }
  });
}
test('hub navigation, exact links, QR downloads, clipboard and back navigation', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  for (const link of brand.links) {
    await page.goto('/mozza-italia');
    await page.locator(`a[href="/mozza-italia/${link.id}"]`).click();
    await expect(page).toHaveURL(`/mozza-italia/${link.id}`);
    const cta = page.getByRole('link', { name: link.cta, exact: false });
    await expect(cta).toHaveAttribute('href', link.url);
    await expect(cta).toHaveAttribute('target', '_blank');
    await expect(cta).toHaveAttribute('rel', 'noopener noreferrer');
    // Intercept the outbound request: confirm the browser target without contacting third parties or submitting a review.
    await context.route(link.url, (route) =>
      route.fulfill({ body: 'Verified outbound target' }),
    );
    const popupPromise = page.waitForEvent('popup');
    await cta.click();
    const popup = await popupPromise;
    await popup.waitForLoadState();
    expect(popup.url()).toBe(new URL(link.url).href);
    await popup.close();
    await page.getByRole('button', { name: 'Copy link' }).click();
    await expect(page.getByRole('status')).toHaveText('Link copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      link.url,
    );
    const downloadPromise = page.waitForEvent('download');
    await page.getByRole('link', { name: 'Download QR' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      `mozza-italia-${link.kind === 'review' ? 'google-review' : link.id}-qr.png`,
    );
    await page.getByRole('link', { name: 'Back to Mozza Italia' }).click();
    await expect(page).toHaveURL('/mozza-italia');
  }
});
test('preview master cannot be downloaded and unknown routes show polished 404', async ({
  page,
}) => {
  await page.goto('/qr/mozza-italia');
  await expect(
    page.getByText('Local / preview master QR', { exact: false }),
  ).toBeVisible();
  await expect(
    page.locator('.asset').first().getByRole('link', { name: 'Download QR' }),
  ).toHaveCount(0);
  for (const path of [
    '/mozza-italia/missing',
    '/unknown',
    '/qr/unknown',
    '/unknown/deep/missing',
  ]) {
    const response = await page.goto(path);
    expect(response?.status()).toBe(404);
    await expect(
      page.getByRole('heading', { name: "This link isn't available." }),
    ).toBeVisible();
    await expect(
      page.getByRole('link', { name: 'Back to Go-Linking' }),
    ).toHaveAttribute('href', '/');
  }
});
test('keyboard focus, reduced motion, fallback and clipboard error', async ({
  page,
}) => {
  await page.route('**/brands/mozza-italia/logo.png', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mozza-italia');
  await expect(page.getByTestId('brand-intro')).toHaveCount(0);
  await expect(page.locator('.brand-wordmark')).toBeVisible();
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  expect(
    await page
      .locator('.brand-main')
      .evaluate((element) => getComputedStyle(element).animationName),
  ).toBe('none');
  await page.goto('/mozza-italia/website');
  await page.evaluate(() => {
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Denied')) },
      configurable: true,
    });
  });
  await page.getByRole('button', { name: 'Copy link' }).click();
  await expect(
    page.getByRole('textbox', { name: 'Destination link to copy' }),
  ).toHaveValue(brand.links[0].url);
});

test('original logo loads crisply and hub choices fit a laptop viewport', async ({
  page,
}) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 800 });
  await page.goto('/mozza-italia');
  const logo = page.locator('.hub-brand-anchor .brand-logo');
  await expect(logo).toBeVisible();
  await expect(logo).toHaveAttribute('src', '/brands/mozza-italia/logo.png');
  expect(
    await logo.evaluate((image: HTMLImageElement) => image.naturalWidth),
  ).toBe(3557);
  expect(
    await logo.evaluate((image) => getComputedStyle(image).objectFit),
  ).toBe('contain');
  const box = await page.locator('.destination-grid').boundingBox();
  expect(box!.y + box!.height).toBeLessThan(800);
  await page.screenshot({
    path: 'test-results/hub-laptop.png',
    fullPage: true,
  });
});
