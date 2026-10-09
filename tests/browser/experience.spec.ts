import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { brands } from '../../src/config/brands';

const brand = brands[0];

for (const width of [360, 390, 430, 768, 1280]) {
  test(`compact hub and staff utility fit and remain accessible at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: width < 768 ? 780 : 900 });
    await page.goto('/mozza-italia');
    await page.evaluate(() => document.fonts.ready);
    // Contrast measurements need the settled state of the brief entrance fade.
    await page.evaluate(() =>
      Promise.all(
        document.getAnimations().map((animation) => animation.finished),
      ),
    );
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(
      'MORE MOZZA.ONE TAP AWAY.',
    );
    await expect(page.locator('.brand-logo')).toBeVisible();
    await expect(page.locator('.brand-logo')).toHaveAttribute(
      'src',
      brand.logo,
    );
    await expect(page.getByTestId('brand-intro')).toHaveCount(0);
    await expect(page.locator('.qr-card, .qr-image')).toHaveCount(0);
    await expect(page.locator('.destination-card')).toHaveCount(3);
    await expect(page.locator('.copy-links')).not.toHaveAttribute('open');
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
    const column = await page.locator('.brand-main').boundingBox();
    expect(column!.width).toBeLessThanOrEqual(520);
    expect(Math.abs(column!.x + column!.width / 2 - width / 2)).toBeLessThan(1);
    const logo = await page.locator('.brand-logo').boundingBox();
    expect(logo!.width / logo!.height).toBeCloseTo(3557 / 1445, 2);
    const rows = await page.locator('.destination-card').all();
    for (const row of rows) {
      const box = await row.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(70);
      expect(box!.height).toBeLessThanOrEqual(80);
      expect(box!.width).toBeCloseTo(column!.width, 0);
      expect(box!.y + box!.height).toBeLessThan(780);
    }
    await expect(
      page.getByRole('button', { name: /Copy .* link/ }),
    ).toHaveCount(0);
    await expect(page.locator('.brand-main')).toHaveCSS(
      'font-family',
      /uiFont/,
    );
    // next/font/local uses the exported variable names as CSS font families.
    await expect(page.locator('h1')).toHaveCSS('font-family', /displayFont/);
    expect(
      await page.evaluate(() => document.fonts.check('400 14px uiFont')),
    ).toBe(true);
    expect(
      await page.evaluate(() => document.fonts.check('700 56px displayFont')),
    ).toBe(true);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    await page.screenshot({
      path: `test-results/hub-${width}.png`,
      fullPage: true,
    });
    await page.locator('summary').click();
    await expect(
      page.getByRole('button', { name: /Copy .* link/ }),
    ).toHaveCount(3);
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
    await page.goto('/qr/mozza-italia');
    await expect(
      page.getByRole('heading', { name: 'QR Assets', exact: true }),
    ).toBeVisible();
    await expect(page.locator('.qr-image')).toHaveCount(4);
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
  });
}

test('one tap navigates in the same tab to every exact configured URL', async ({
  page,
  context,
}) => {
  for (const link of brand.links) {
    await context.route(new URL(link.url).href, (route) =>
      route.fulfill({ body: 'Verified outbound target' }),
    );
    await page.goto('/mozza-italia');
    const row = page.getByRole('link', {
      name: `${link.title} ${link.description}`,
      exact: true,
    });
    await expect(row).toHaveAttribute('href', link.url);
    await expect(row).not.toHaveAttribute('target');
    await row.click();
    await expect(page).toHaveURL(new URL(link.url).href);
    expect(context.pages()).toHaveLength(1);
  }
});

test('all destinations, original logo and manual copying work without JavaScript', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
  });
  const page = await context.newPage();
  for (const link of brand.links) {
    await context.route(new URL(link.url).href, (route) =>
      route.fulfill({ body: 'Verified outbound target without JavaScript' }),
    );
  }
  await page.goto('/mozza-italia');
  await expect(page.locator('.brand-logo')).toBeVisible();
  await page.locator('summary').click();
  for (const link of brand.links) {
    await expect(
      page.getByRole('textbox', {
        name: `${link.title} link to copy manually`,
      }),
    ).toHaveValue(link.url);
  }
  await expect(page.getByRole('button', { name: /Copy .* link/ })).toHaveCount(
    0,
  );
  for (const link of brand.links) {
    await page.goto('/mozza-italia');
    await page.locator(`.destination-card[href="${link.url}"]`).click();
    await expect(page).toHaveURL(new URL(link.url).href);
  }
  await context.close();
});

test('existing deep links return server redirects only to approved destinations', async ({
  request,
}) => {
  for (const link of brand.links) {
    const response = await request.get(`/mozza-italia/${link.id}`, {
      maxRedirects: 0,
    });
    expect(response.status()).toBe(307);
    expect(response.headers().location).toBe(link.url);
    expect(await response.text()).not.toContain('qr-image');
  }
});

test('copy controls write exact URLs, announce success, then reset', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/mozza-italia');
  await page.locator('summary').click();
  for (const link of brand.links) {
    const row = page.locator('.copy-control').filter({
      has: page.getByRole('button', {
        name: `Copy ${link.title} link`,
        exact: true,
      }),
    });
    await row.getByRole('button').click();
    await expect(row.locator('.copy-action')).toHaveText('Copied!');
    await expect(row.getByRole('status')).toHaveText(
      `${link.title} link copied.`,
    );
    await expect(row.locator('.copy-action')).toHaveClass(/copied/);
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      link.url,
    );
    await expect(row.getByRole('textbox')).toHaveCount(0);
  }
  await expect(page.locator('.copy-action.copied')).toHaveCount(0, {
    timeout: 5000,
  });
  await expect(page.getByRole('status').last()).toHaveText('');
});

for (const clipboard of ['denied', 'unavailable']) {
  test(`clipboard ${clipboard} shows selectable, read-only exact URLs`, async ({
    page,
  }) => {
    await page.goto('/mozza-italia');
    await page.evaluate((clipboard) => {
      Object.defineProperty(navigator, 'clipboard', {
        value:
          clipboard === 'unavailable'
            ? undefined
            : { writeText: () => Promise.reject(new Error('Denied')) },
        configurable: true,
      });
    }, clipboard);
    await page.locator('summary').click();
    for (const link of brand.links) {
      await page
        .getByRole('button', { name: `Copy ${link.title} link`, exact: true })
        .click();
      const input = page.getByRole('textbox', {
        name: `${link.title} link to copy manually`,
      });
      await expect(input).toHaveValue(link.url);
      await expect(input).toHaveAttribute('readonly');
      await input.focus();
      expect(
        await input.evaluate(
          (element: HTMLInputElement) =>
            element.selectionEnd! - element.selectionStart!,
        ),
      ).toBe(link.url.length);
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
  });
}

test('keyboard reaches every destination, opens the accordion and copies', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.goto('/mozza-italia');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  for (const link of brand.links) {
    await page.keyboard.press('Tab');
    const row = page.locator(`.destination-card[href="${link.url}"]`);
    await expect(row).toBeFocused();
    await expect(row).toHaveCSS('outline-style', 'solid');
  }
  await page.keyboard.press('Tab');
  await expect(page.locator('summary')).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('.copy-links')).toHaveAttribute('open');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('button', { name: 'Copy Website link', exact: true }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.getByRole('status').first()).toHaveText(
    'Website link copied.',
  );
});

test('reduced motion disables animations and movement; missing logo falls back', async ({
  page,
}) => {
  await page.route('**/brands/mozza-italia/logo.png', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mozza-italia');
  await expect(page.locator('.brand-wordmark')).toBeVisible();
  await expect(page.locator('.brand-main')).toHaveCSS('animation-name', 'none');
  const row = page.locator('.destination-card').first();
  await row.hover();
  await expect(row).toHaveCSS('transition-duration', '0s');
  await expect(row).toHaveCSS('transform', 'none');
  await expect(row.locator('.link-arrow')).toHaveCSS('transform', 'none');
  await page.locator('summary').click();
  await expect(page.locator('.copy-chevron')).toHaveCSS(
    'transition-duration',
    '0s',
  );
  await expect(
    page.getByRole('button', { name: 'Copy Website link', exact: true }),
  ).toBeVisible();
});

test('staff QR downloads remain available and preview master remains protected', async ({
  page,
}) => {
  await page.goto('/qr/mozza-italia');
  await expect(
    page.getByText('Local / preview master QR', { exact: false }),
  ).toBeVisible();
  await expect(
    page.locator('.asset').first().getByRole('link', { name: 'Download QR' }),
  ).toHaveCount(0);
  for (const [index, link] of brand.links.entries()) {
    const asset = page.locator('.asset').nth(index + 1);
    await expect(asset.locator('code')).toHaveText(link.url);
    const downloadPromise = page.waitForEvent('download');
    await asset.getByRole('link', { name: 'Download QR' }).click();
    const download = await downloadPromise;
    expect(download.suggestedFilename()).toBe(
      `mozza-italia-${link.kind === 'review' ? 'google-review' : link.id}-qr.png`,
    );
  }
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute(
    'content',
    'noindex, nofollow',
  );
});

test('unknown routes return 404 and cannot redirect externally', async ({
  page,
}) => {
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
