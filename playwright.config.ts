import { defineConfig, devices } from '@playwright/test';

const PORT = process.env.PORT || '3000';
const BASE_URL = `http://localhost:${PORT}`;

/**
 * Playwright config for the HR app.
 * - `tests/e2e`  -> UI tests driven through Chromium.
 * - `tests/api`  -> API tests using the built-in `request` fixture.
 *
 * The `webServer` block re-seeds the database and starts the app before the
 * suite runs, so every run starts from a known, deterministic state.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: [['html'], ['list']],

  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
  },

  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],

  webServer: {
    command: 'npm run seed && npm start',
    url: `${BASE_URL}/healthz`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
