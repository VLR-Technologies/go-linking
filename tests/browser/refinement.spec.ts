import { test, expect } from '@playwright/test';
import { brands } from '../../src/config/brands';

for (const width of [390, 1280])
  test(`entire company cards and keyboard navigation work at ${width}`, async ({
    page,
  }) => {
    await page.setViewportSize({ width, height: 900 });
    for (const brand of brands) {
      for (const target of ['.company-visual', '.company-description']) {
        await page.goto('/');
        const card = page.locator('.company-card').filter({
          has: page.getByRole('heading', { name: brand.name, exact: true }),
        });
        const bounds = (await card.boundingBox())!;
        const targetBounds = (await card.locator(target).boundingBox())!;
        await card.click({
          position: {
            x: targetBounds.x - bounds.x + targetBounds.width / 2,
            y: targetBounds.y - bounds.y + targetBounds.height / 2,
          },
        });
        await expect(page).toHaveURL(`/${brand.slug}`);
        await page
          .getByRole('link', { name: 'Back to Go-Linking', exact: true })
          .click();
        await expect(page).toHaveURL('/');
      }
      const link = page.getByRole('link', {
        name: `Open ${brand.name}`,
        exact: true,
      });
      await link.focus();
      await expect(link).toBeFocused();
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(`/${brand.slug}`);
    }
  });

test('VLR identity is preserved and landing-page attribution is concise', async ({
  page,
}) => {
  const tagline = 'ENGINEERING INTELLIGENCE FOR TOMORROW';
  for (const route of ['/', ...brands.map((b) => `/${b.slug}`)]) {
    await page.goto(route);
    const footer = page.getByRole('contentinfo');
    await expect(footer.locator('.vlr-lockup strong')).toHaveText(
      'TECHNOLOGIES',
    );
    await expect(footer.locator('.vlr-lockup img')).toHaveAttribute(
      'src',
      '/brands/vlr/logo.png',
    );
    if (route !== '/')
      await expect(footer.locator('.vlr-tagline')).toHaveText(tagline);
    else await expect(footer.locator('.vlr-tagline')).toHaveCount(0);
    await expect(footer.locator('.vlr-lockup')).not.toContainText(
      'VLR Technologies',
    );
    await expect(footer.locator('a').first()).toHaveAttribute(
      'href',
      'https://vlrtechnologies.net/',
    );
    if (route === '/') {
      await expect(
        page.locator('.directory-header .vlr-lockup strong'),
      ).toHaveText('TECHNOLOGIES');
      await expect(page.locator('.directory-header .vlr-tagline')).toHaveCount(
        0,
      );
      await expect(footer).toContainText(
        '© 2026 VLR Technologies. All rights reserved.',
      );
    }
  }
});

test('directory controls remain independent with keyboard and reduced motion', async ({
  page,
  context,
}) => {
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  for (const brand of brands) {
    const copy = page.getByRole('button', {
      name: `Copy ${brand.name} link`,
      exact: true,
    });
    await copy.focus();
    await page.keyboard.press('Enter');
    await expect(page).toHaveURL('/');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe(
      `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/${brand.slug}`,
    );
    const qr = page.getByRole('button', {
      name: `QR for ${brand.name}`,
      exact: true,
    });
    await qr.focus();
    await page.keyboard.press('Enter');
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page).toHaveURL('/');
    await page.keyboard.press('Escape');
    await expect(qr).toBeFocused();
  }
  const card = page.locator('.company-card').first();
  await card.hover();
  await expect(card).toHaveCSS('transform', 'none');
  expect(context.pages()).toHaveLength(1);
});

test('Mozza logo fallback and original card proportions are retained', async ({
  page,
}) => {
  await page.route('**/brands/mozza-italia/logo.png', (route) => route.abort());
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/mozza-italia');
  await expect(page.locator('.brand-wordmark')).toBeVisible();
  for (const row of await page.locator('.destination-card').all())
    expect((await row.boundingBox())!.height).toBe(78);
  await expect(page.locator('.brand-header')).toHaveCSS(
    'animation-name',
    'none',
  );
});
