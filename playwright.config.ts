import { defineConfig } from '@playwright/test';
const port = process.env.PLAYWRIGHT_PORT || '3000';
if (!/^\d+$/.test(port) || Number(port) < 1024 || Number(port) > 65535)
  throw new Error('Invalid PLAYWRIGHT_PORT');
const baseURL = `http://localhost:${port}`;
const development = process.env.PLAYWRIGHT_SERVER_MODE === 'development';
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
    command: `npm run ${development ? 'dev' : 'start'} -- --port ${port}`,
    env: development ? { NEXT_PUBLIC_SITE_URL: baseURL } : {},
    url: baseURL,
    reuseExistingServer: false,
    timeout: 60000,
  },
  reporter: 'list',
});
