import { test, expect } from '@playwright/test';
import { brands } from '../../src/config/brands';
test('root serves the VLR client directory', async ({ request, page }) => {
  const response = await request.get('/', { maxRedirects: 0 });
  expect(response.status()).toBe(200);
  await page.goto('/');
  await expect(page.locator('.company-card')).toHaveCount(3);
  for (const brand of brands)
    await expect(
      page.getByRole('link', { name: `Open ${brand.name}`, exact: true }),
    ).toHaveAttribute('href', `/${brand.slug}`);
});
