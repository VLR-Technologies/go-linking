import { defineConfig } from '@playwright/test';
const port = process.env.PLAYWRIGHT_PORT || '3000';
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535)
  throw new Error('Invalid PLAYWRIGHT_PORT');
const baseURL = `http://localhost:${port}`;
export default defineConfig({
  testDir: './tests/browser',
  fullyParallel: false,
  workers: 1,
  use: {
    baseURL,
    browserName: 'chromium',
    launchOptions: { channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: `npm run start -- --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 60000,
  },
  reporter: 'list',
});
