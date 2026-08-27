import { defineConfig, devices } from '@playwright/test';

// E2E + accessibility tests run against the full dev app (vite :3000 proxying
// /api -> backend :5000) so configurator pricing, cart and forms work. In CI use
// the same `npm run dev` webServer. Static-only a11y can also run against
// `npm run preview`, but the configurator/cart specs need the API.
export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30000,
  expect: { timeout: 10000 },
  fullyParallel: false,
  workers: 1,
  reporter: [['line']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry'
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile', use: { ...devices['Pixel 5'] } }
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    timeout: 120000,
    reuseExistingServer: true
  }
});
