import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { brands } from '../../src/config/brands';

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`premium homepage composition and CTA at ${width}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    expect((await page.locator('h1').innerText()).replaceAll('\n', ' ')).toBe(
      'One Link. Endless Connections.',
    );
    await expect(
      page.getByRole('heading', { level: 2, name: 'Explore the Network.' }),
    ).toBeVisible();
    await expect(page.locator('.company-card')).toHaveCount(brands.length);
    await expect(
      page.locator(
        '.partner-label, .directory-label, .company-number, .company-tagline, .directory-note, .vlr-tagline',
      ),
    ).toHaveCount(0);
    for (const [index, brand] of brands.entries()) {
      const card = page.locator('.company-card').nth(index);
      await expect(card.getByRole('heading', { level: 3 })).toHaveText(
        brand.name,
      );
      expect(
        await card
          .locator('.company-logo')
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      ).toBe(true);
      await expect(card.locator('.company-description')).toContainText(
        brand.category,
      );
      if (brand.placeholder)
        await expect(card.locator('.company-description')).toContainText(
          'Preview',
        );
      await expect(card.locator('a button, button a')).toHaveCount(0);
      for (const control of await card.locator('button.card-action').all()) {
        const box = (await control.boundingBox())!;
        expect(box.width).toBeGreaterThanOrEqual(44);
        expect(box.height).toBeGreaterThanOrEqual(44);
      }
    }
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    for (const time of [1000, 5000, 9000, 13000]) {
      await page.evaluate((time) => {
        for (const animation of document.getAnimations()) {
          animation.pause();
          animation.currentTime = time;
        }
      }, time);
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      expect(
        await page.locator('.connection-cta').evaluate((element) => {
          const box = element.getBoundingClientRect();
          return element.contains(
            document.elementFromPoint(
              box.x + box.width / 2,
              box.y + box.height / 2,
            ),
          );
        }),
      ).toBe(true);
    }
    await page.screenshot({
      path: `test-results/premium-directory-${width}.png`,
      fullPage: true,
    });
    const hub = (await page.locator('.network-hub').boundingBox())!;
    for (const node of await page.locator('.network-node').all()) {
      const box = (await node.boundingBox())!;
      const overlaps =
        box.x < hub.x + hub.width &&
        box.x + box.width > hub.x &&
        box.y < hub.y + hub.height &&
        box.y + box.height > hub.y;
      expect(
        overlaps,
        'Network nodes should remain clear of the central hub',
      ).toBe(false);
    }
    await page.getByRole('link', { name: 'Explore Connections' }).click();
    await expect(page).toHaveURL('/#connections');
    await expect
      .poll(() =>
        page.locator('#connections').evaluate((element) => {
          const target = element.getBoundingClientRect().y + scrollY;
          const maximum = document.documentElement.scrollHeight - innerHeight;
          return Math.abs(scrollY - Math.min(target - 24, maximum));
        }),
      )
      .toBeLessThanOrEqual(2);
    await expect(page.locator('#connections')).toBeFocused();
    await expect(
      page.getByRole('link', { name: 'VLR Technologies', exact: true }),
    ).toHaveAttribute('href', 'https://vlrtechnologies.net/');
    expect(errors).toEqual([]);
  });
}

test('network motion has stable bounds, a pause control, and reduced-motion support', async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 700 });
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const words = page.locator('.rotating-words');
  const bounds = await words.boundingBox();
  for (const [index, time] of [1000, 5000, 9000, 13000].entries()) {
    await page.evaluate((time) => {
      for (const element of document.querySelectorAll('.rotating-word')) {
        const animation = element.getAnimations()[0];
        animation.pause();
        animation.currentTime = time;
      }
    }, time);
    await expect(page.locator(`.word-${index}`)).toHaveCSS('opacity', '1');
    expect(await words.boundingBox()).toEqual(bounds);
  }
  await expect(page.locator('.connection-network')).toHaveAttribute(
    'aria-hidden',
    'true',
  );
  await expect(page.locator('.connected-hero [aria-live]')).toHaveCount(0);
  await page
    .getByRole('checkbox', { name: 'Pause connection animation' })
    .check();
  await expect(page.locator('.word-0')).toHaveCSS('opacity', '1');
  await expect(page.locator('.word-1')).toHaveCSS('opacity', '0');
  for (const path of await page.locator('.connection-pulses path').all())
    await expect(path).toHaveCSS('animation-play-state', 'paused');
  await expect(page.getByText('Resume motion', { exact: true })).toBeVisible();
  await page
    .getByRole('checkbox', { name: 'Pause connection animation' })
    .uncheck();
  await page.locator('.directory-footer').scrollIntoViewIfNeeded();
  await expect(page.locator('.directory-shell')).toHaveAttribute(
    'data-motion-suspended',
    'true',
  );
  await page.locator('.directory-header').scrollIntoViewIfNeeded();
  await expect(page.locator('.directory-shell')).toHaveAttribute(
    'data-motion-suspended',
    'false',
  );
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await expect(page.locator('.word-0')).toHaveCSS('opacity', '1');
  await expect(page.locator('.word-1')).toHaveCSS('opacity', '0');
  expect(
    await page
      .locator('.connected-hero')
      .evaluate((element) => element.getAnimations({ subtree: true }).length),
  ).toBe(0);
});

test('homepage remains discoverable without JavaScript and the skip link works', async ({
  browser,
  baseURL,
}) => {
  const context = await browser.newContext({
    javaScriptEnabled: false,
    baseURL,
    reducedMotion: 'reduce',
  });
  const page = await context.newPage();
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(
    page.getByRole('link', { name: 'Skip to content' }),
  ).toBeFocused();
  await page.keyboard.press('Enter');
  await expect(page.locator('#main')).toBeFocused();
  await page.getByRole('link', { name: 'Explore Connections' }).click();
  await expect(page).toHaveURL('/#connections');
  await page
    .getByRole('link', { name: `Open ${brands[0].name}`, exact: true })
    .click();
  await expect(page).toHaveURL(`/${brands[0].slug}`);
  await context.close();
});

test('homepage clipboard failure keeps the exact share link and returns focus', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() =>
    Object.defineProperty(navigator, 'clipboard', {
      value: { writeText: () => Promise.reject(new Error('Denied')) },
      configurable: true,
    }),
  );
  const copy = page.getByRole('button', {
    name: `Copy ${brands[0].name} link`,
    exact: true,
  });
  await copy.click();
  await expect(page.getByRole('textbox')).toHaveValue(
    `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${brands[0].slug}`,
  );
  await expect(page).toHaveURL('/');
  await page.keyboard.press('Escape');
  await expect(copy).toBeFocused();
});
