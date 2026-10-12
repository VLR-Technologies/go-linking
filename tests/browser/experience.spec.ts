import { test, expect } from '@playwright/test';
import { brands } from '../../src/config/brands';
const brand = brands[0];
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

for (const width of [360, 430, 768, 1280]) {
  test(`food floats stay clear of content, clip safely, and can be paused at ${width}px`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('/mozza-italia');
    await page.evaluate(() => document.fonts.ready);
    const pause = page.getByRole('checkbox', {
      name: 'Pause background animation',
    });
    await pause.check();
    for (const piece of await page.locator('.food-piece:visible').all()) {
      await expect(piece).toHaveCSS('animation-play-state', 'paused');
      expect(
        await piece
          .locator('img')
          .evaluate(
            (image: HTMLImageElement) =>
              image.complete && image.naturalWidth > 0,
          ),
      ).toBe(true);
    }
    await pause.uncheck();
    for (const phase of [0.2, 0.5, 0.8]) {
      await page.evaluate((phase) => {
        for (const animation of document.getAnimations()) {
          const timing = animation.effect?.getTiming();
          if (timing?.iterations === Infinity) {
            animation.pause();
            animation.currentTime = Number(timing.duration) * phase;
          }
        }
      }, phase);
      const protectedContent = await page
        .locator(width < 768 ? '.hub-section' : '.brand-main')
        .boundingBox();
      const scene = await page.locator('.food-scene').boundingBox();
      for (const piece of await page.locator('.food-piece:visible').all()) {
        const box = await piece.boundingBox();
        // Intersect with the clipped scene before testing overlap.
        const left = Math.max(box!.x, scene!.x);
        const right = Math.min(box!.x + box!.width, scene!.x + scene!.width);
        const top = Math.max(box!.y, scene!.y);
        const bottom = Math.min(box!.y + box!.height, scene!.y + scene!.height);
        const content = protectedContent!;
        const overlaps =
          right > left &&
          bottom > top &&
          right > content.x &&
          left < content.x + content.width &&
          bottom > content.y &&
          top < content.y + content.height;
        expect(overlaps).toBe(false);
      }
      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth <= innerWidth,
        ),
      ).toBe(true);
      for (const row of await page.locator('.destination-card').all()) {
        expect(
          await row.evaluate((element) => {
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
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const scene = (await page.locator('.food-scene').boundingBox())!;
    for (const piece of await page.locator('.food-piece:visible').all()) {
      await expect(piece).toHaveCSS('animation-name', 'none');
      const box = (await piece.boundingBox())!;
      expect(box.y + box.height).toBeGreaterThan(scene.y);
      expect(box.y).toBeLessThan(scene.y + scene.height);
    }
  });
}
