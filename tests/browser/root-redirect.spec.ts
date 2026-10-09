import { test, expect } from '@playwright/test';

test('root returns a server redirect without the former landing page', async ({
  request,
  page,
}) => {
  const response = await request.get('/', { maxRedirects: 0 });
  expect(response.status()).toBe(307);
  expect(response.headers().location).toBe('/mozza-italia');
  const body = await response.text();
  for (const oldCopy of [
    'VLR TECHNOLOGIES PRESENTS',
    'View Mozza Italia Demo',
    'MADE FOR REAL-WORLD CONNECTIONS',
  ]) {
    expect(body).not.toContain(oldCopy);
  }

  await page.goto('/');
  await expect(page).toHaveURL('/mozza-italia');
  await expect(page.getByTestId('brand-intro')).toBeVisible();
  await expect(page.getByTestId('brand-intro')).toHaveCount(0, {
    timeout: 5000,
  });
  await expect(
    page.getByRole('heading', { name: 'What would you like to explore?' }),
  ).toBeVisible();
});
