import { test, expect } from '@playwright/test';

for (const width of [390, 430, 768, 1024, 1280, 1440]) {
  test(`chef intro stays centered and hands off to the existing header at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    const now = new Date();
    await page.clock.install({ time: now });
    await page.clock.pauseAt(now);
    await page.goto('/mozza-italia');
    await expect(page.getByTestId('brand-intro')).toBeVisible();
    await expect(page.locator('.intro-chef')).toHaveAttribute(
      'src',
      '/brands/mozza-italia/chef.png',
    );
    await expect(page.locator('.intro-logo-full')).toHaveAttribute(
      'src',
      '/brands/mozza-italia/logo.png',
    );
    // Inspect the same production animations at deterministic points, without
    // replacing their geometry or modifying either supplied asset.
    for (const [phase, time] of [
      ['chef', 243],
      ['crossfade', 648],
      ['merged', 783],
      ['settled', 1215],
    ] as const) {
      await page.evaluate((time) => {
        document.getAnimations().forEach((animation) => {
          animation.pause();
          animation.currentTime = time;
        });
      }, time);
      if (phase === 'chef') {
        const box = await page.locator('.intro-chef').boundingBox();
        expect(Math.abs(box!.x + box!.width / 2 - width / 2)).toBeLessThan(2);
        expect(box!.x).toBeGreaterThanOrEqual(0);
        expect(box!.x + box!.width).toBeLessThanOrEqual(width);
        await expect(page.locator('.intro-logo-full')).toHaveCSS(
          'opacity',
          '0',
        );
      }
      if (phase === 'merged') {
        await expect(page.locator('.intro-chef')).toHaveCSS('opacity', '0');
        await expect(page.locator('.intro-logo-full')).toHaveCSS(
          'opacity',
          '1',
        );
      }
      if (phase === 'settled') {
        const moving = await page.locator('.intro-identity').boundingBox();
        const final = await page
          .locator('.hub-brand-anchor .brand-identity')
          .boundingBox();
        expect(Math.abs(moving!.x - final!.x)).toBeLessThan(2);
        expect(Math.abs(moving!.y - final!.y)).toBeLessThan(2);
        expect(Math.abs(moving!.width - final!.width)).toBeLessThan(2);
      }
      await page.screenshot({
        path: `test-results/intro-${phase}-${width}.png`,
      });
    }
    await page.getByRole('button', { name: 'Skip intro' }).click();
    await expect(page.getByTestId('brand-intro')).toHaveCount(0);
    await expect(page.locator('.hub-brand-anchor .brand-logo')).toBeVisible();
  });
}

test('fresh intro completes within 1.2�1.5 seconds', async ({ page }) => {
  await page.addInitScript(() => {
    let started: number | undefined;
    const observer = new MutationObserver(() => {
      const intro = document.querySelector('[data-testid="brand-intro"]');
      if (intro && started === undefined) started = performance.now();
      if (!intro && started !== undefined) {
        document.documentElement.dataset.introElapsed = String(
          performance.now() - started,
        );
        observer.disconnect();
      }
    });
    observer.observe(document, { childList: true, subtree: true });
  });
  await page.goto('/mozza-italia');
  await expect(page.locator('html')).toHaveAttribute(
    'data-intro-elapsed',
    /.+/,
  );
  const elapsed = Number(
    await page.locator('html').getAttribute('data-intro-elapsed'),
  );
  expect(elapsed).toBeGreaterThanOrEqual(1200);
  expect(elapsed).toBeLessThanOrEqual(1500);
});
