// @ts-check
const { defineConfig, devices } = require('@playwright/test');
const { resolveBackendPython } = require('./resolve-backend-python');
const { E2E_WORKER_COUNT, getWorkerEnv, E2E_FRONTEND_BASE_URL } = require('./worker-env');

const backendPython = resolveBackendPython();
const reuseExistingServer = false;

/** @type {import('@playwright/test').PlaywrightTestConfig['webServer']} */
function buildWebServers() {
  /** @type {import('@playwright/test').PlaywrightTestConfig['webServer']} */
  const servers = [];

  for (let i = 0; i < E2E_WORKER_COUNT; i += 1) {
    const env = getWorkerEnv(i);
    servers.push({
      command: `"${backendPython}" -m uvicorn app.main:app --host 127.0.0.1 --port ${env.apiPort}`,
      cwd: '../backend',
      url: `${env.apiBaseUrl}/health`,
      timeout: 120_000,
      reuseExistingServer,
      env: {
        DATABASE_URL: env.databaseUrl,
        ASSET_LOOKUP_MODE: 'yfinance'
      }
    });
    servers.push({
      command: `npm run dev -- --host 127.0.0.1 --port ${env.frontendPort} --strictPort`,
      cwd: '../frontend',
      url: env.frontendBaseUrl,
      timeout: 120_000,
      reuseExistingServer,
      env: {
        VITE_API_BASE_URL: env.apiBaseUrl
      }
    });
  }

  return servers;
}

/** @type {import('@playwright/test').PlaywrightTestConfig} */
module.exports = defineConfig({
  globalSetup: require.resolve('./global-setup.js'),
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: E2E_WORKER_COUNT,
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
      testIgnore: ['**/helpers/**', '**/fixtures/**'],
      timeout: 60_000,
      retries: process.env.CI ? 1 : 0,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: E2E_FRONTEND_BASE_URL,
        actionTimeout: 15_000
      }
    }
  ],
  webServer: buildWebServers()
});
