import { defineConfig } from '@playwright/test';
import { randomBytes } from 'node:crypto';
process.env.GO_LINKING_ADMIN_USERNAME ||= 'qa-admin';
process.env.GO_LINKING_ADMIN_PASSWORD ||= randomBytes(20).toString('hex');
process.env.GO_LINKING_SESSION_SECRET ||= randomBytes(32).toString('hex');
export default defineConfig({
  testDir: './tests/admin',
  workers: 1,
  fullyParallel: false,
  timeout: 180000,
  expect: { timeout: 15000 },
  use: {
    baseURL: 'http://localhost:3116',
    browserName: 'chromium',
    launchOptions: { channel: process.env.PLAYWRIGHT_CHANNEL || 'msedge' },
    screenshot: 'only-on-failure',
  },
  webServer: {
    command: 'node node_modules/next/dist/bin/next dev --port 3116',
    url: 'http://localhost:3116/admin/login',
    reuseExistingServer: false,
    timeout: 120000,
    env: {
      GO_LINKING_QA: '1',
      GO_LINKING_ADMIN_USERNAME: process.env.GO_LINKING_ADMIN_USERNAME,
      GO_LINKING_ADMIN_PASSWORD: process.env.GO_LINKING_ADMIN_PASSWORD,
      GO_LINKING_SESSION_SECRET: process.env.GO_LINKING_SESSION_SECRET,
      NEXT_PUBLIC_SITE_URL:
        process.env.PLAYWRIGHT_SITE_URL || 'http://localhost:3116',
    },
  },
  reporter: 'list',
});
