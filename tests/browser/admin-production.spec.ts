import { test, expect } from '@playwright/test';
test('production admin and local write adapters fail closed', async ({
  page,
  request,
  baseURL,
}) => {
  await page.goto('/admin');
  await expect(page).toHaveURL(/\/admin\/login/);
  await expect(
    page.getByRole('button', { name: 'Sign in →', exact: true }),
  ).toBeDisabled();
  // A production server bound to 0.0.0.0 may reject the localhost Origin
  // before reaching auth; both paths must fail closed.
  const loginStatus = (
    await request.post('/api/admin/auth', {
      headers: { Origin: baseURL! },
      data: { username: 'anything', password: 'anything' },
    })
  ).status();
  expect([403, 503]).toContain(loginStatus);
  const writeStatus = (
    await request.post('/api/admin/brands', {
      headers: { Origin: baseURL! },
      data: {},
    })
  ).status();
  expect([401, 403]).toContain(writeStatus);
  expect((await request.get('/api/admin/brands')).status()).toBe(401);
  expect(
    (
      await request.get('/api/assets/00000000-0000-0000-0000-000000000000.png')
    ).status(),
  ).toBe(404);
});
