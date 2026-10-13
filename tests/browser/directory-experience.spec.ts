import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { brands } from '../../src/config/brands';

for (const width of [360, 390, 430, 768, 1024, 1280, 1440]) {
  test(`connected homepage composition and CTA at ${width}`, async ({
    page,
  }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/');
    await page.evaluate(() => document.fonts.ready);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveText('GO-LINKING.');
    await expect(page.locator('.company-card')).toHaveCount(brands.length);
    await expect(page.locator('.connection-count')).toContainText(
      String(brands.length).padStart(2, '0'),
    );
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
      await expect(card.locator('.preview-badge')).toHaveCount(
        brand.placeholder ? 1 : 0,
      );
      await expect(card.locator('a button, button a')).toHaveCount(0);
    }
    const hero = (await page.locator('.connected-hero').boundingBox())!;
    expect(hero.height).toBeLessThan(width <= 620 ? 630 : 540);
    expect(
      (
        await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21aa'])
          .analyze()
      ).violations,
    ).toEqual([]);
    for (const time of [1000, 4600, 8200, 11800]) {
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
      for (const selector of ['.connection-cta', '.connection-about']) {
        expect(
          await page.locator(selector).evaluate((element) => {
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
    }
    await page.screenshot({
      path: `test-results/connected-directory-${width}.png`,
      fullPage: true,
    });
    await page.getByRole('link', { name: 'Explore connections' }).click();
    await expect(page).toHaveURL('/#connections');
    // Short desktop pages may hit the document end before the 24px scroll margin.
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
      page.getByRole('link', { name: 'About VLR Technologies' }),
    ).toHaveAttribute('href', 'https://vlrtechnologies.net/');
    expect(errors).toEqual([]);
  });
}

test('word loop keeps its bounds, transitions smoothly, and pauses accessibly', async ({
  page,
}) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  const words = page.locator('.rotating-words');
  const bounds = await words.boundingBox();
  for (const [index, time] of [1000, 4600, 8200, 11800].entries()) {
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
  for (const time of [3000, 3200, 3400, 3600, 3800, 4000]) {
    await page.evaluate((time) => {
      for (const element of document.querySelectorAll('.rotating-word'))
        element.getAnimations()[0].currentTime = time;
    }, time);
    const opacity = await page
      .locator('.rotating-word')
      .evaluateAll((elements) =>
        Math.max(
          ...elements.map((element) =>
            Number(getComputedStyle(element).opacity),
          ),
        ),
      );
    expect(opacity).toBeGreaterThan(0.3);
    expect(await words.boundingBox()).toEqual(bounds);
  }
  await expect(page.locator('.hero-headline .sr-only')).toContainText(
    'brands, experiences, connections, and possibilities',
  );
  await expect(page.locator('.hero-headline [aria-live]')).toHaveCount(0);
  await page
    .getByRole('checkbox', { name: 'Pause connection animation' })
    .check();
  await expect(page.locator('.word-0')).toHaveCSS('opacity', '1');
  await expect(page.locator('.word-1')).toHaveCSS('opacity', '0');
  for (const node of await page.locator('.network-node').all())
    await expect(node).toHaveCSS('animation-play-state', 'paused');
  expect(
    await page
      .locator('.network-hub')
      .evaluate(
        (element) => getComputedStyle(element, '::before').animationPlayState,
      ),
  ).toBe('paused');
  await page
    .getByRole('checkbox', { name: 'Pause connection animation' })
    .uncheck();
  await page.locator('.footer').scrollIntoViewIfNeeded();
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
  await page.getByRole('link', { name: 'Explore connections' }).click();
  await expect(page).toHaveURL('/#connections');
  await page
    .getByRole('link', { name: `Open ${brands[0].name}`, exact: true })
    .click();
  await expect(page).toHaveURL(`/${brands[0].slug}`);
  await context.close();
});
