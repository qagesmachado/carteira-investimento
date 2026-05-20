// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { resolveBackendPython } = require('./resolve-backend-python');

const backendPython = resolveBackendPython();
const { E2E_API_PORT, E2E_API_BASE_URL, E2E_FRONTEND_PORT, E2E_FRONTEND_BASE_URL } =
  require('./test-env');

const reuseExistingServer = false;

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig({
  globalSetup: require.resolve('./global-setup.js'),
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
    ...(process.env.PLAYWRIGHT_JSON_OUTPUT
      ? [['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT }]]
      : [])
  ],
  use: {
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'api',
      testDir: './api',
      testMatch: '**/*.spec.ts'
    },
    {
      name: 'ui',
      testDir: './specs',
      testMatch: '**/*.spec.ts',
      testIgnore: '**/helpers/**',
      timeout: 60_000,
      retries: process.env.CI ? 1 : 0,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: E2E_FRONTEND_BASE_URL,
        actionTimeout: 15_000
      }
    }
  ],
  webServer: [
    {
      command: `"${backendPython}" -m uvicorn app.main:app --host 127.0.0.1 --port ${E2E_API_PORT}`,
      cwd: '../backend',
      url: `${E2E_API_BASE_URL}/health`,
      timeout: 120_000,
      reuseExistingServer,
      env: {
        DATABASE_URL: 'sqlite:///./data/test/carteira.db',
        PORTFOLIOS_DATABASE_URL: 'sqlite:///./data/test/portfolios.db',
        ASSET_LOOKUP_MODE: 'yfinance'
      }
    },
    {
      command: `npm run dev -- --host 127.0.0.1 --port ${E2E_FRONTEND_PORT} --strictPort`,
      cwd: '../frontend',
      url: E2E_FRONTEND_BASE_URL,
      timeout: 120_000,
      reuseExistingServer,
      env: {
        VITE_API_BASE_URL: E2E_API_BASE_URL
      }
    }
  ]
});
