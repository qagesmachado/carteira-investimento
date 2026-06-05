// @ts-check
// Config de smoke (somente leitura) contra o EXECUTÁVEL empacotado.
// Lança o .exe numa porta fixa, sem abrir navegador, com banco temporário,
// e roda apenas os specs tagueados @smoke (origem única: SPA + /api).
const path = require('node:path');
const os = require('node:os');
const fs = require('node:fs');

const { defineConfig, devices } = require('@playwright/test');

const SMOKE_PORT = Number(process.env.SMOKE_PORT || 8099);
const SMOKE_BASE_URL = process.env.SMOKE_BASE_URL || `http://127.0.0.1:${SMOKE_PORT}`;

// Exposto aos processos worker (o fixture `page` usa SMOKE_BASE_URL via worker-env.js).
process.env.SMOKE_BASE_URL = SMOKE_BASE_URL;

const DEFAULT_EXE = path.resolve(
  __dirname,
  '..',
  'dist',
  'CarteiraInvestimentos',
  'CarteiraInvestimentos.exe'
);
const SMOKE_EXE = process.env.SMOKE_EXE || DEFAULT_EXE;

// Banco temporário isolado (nunca toca no banco real em %LOCALAPPDATA%).
const smokeDbDir = fs.mkdtempSync(path.join(os.tmpdir(), 'carteira-smoke-'));
const smokeDbPath = path.join(smokeDbDir, 'carteira-smoke.db').replace(/\\/g, '/');
const DATABASE_URL = process.env.DATABASE_URL || `sqlite:///${smokeDbPath}`;

module.exports = defineConfig({
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  workers: 1,
  retries: 0,
  grep: /@smoke/,
  reporter: [
    ['list'],
    ...(process.env.PLAYWRIGHT_JSON_OUTPUT
      ? [['json', { outputFile: process.env.PLAYWRIGHT_JSON_OUTPUT }]]
      : [])
  ],
  use: {
    trace: 'on-first-retry'
  },
  projects: [
    {
      name: 'smoke',
      testDir: './specs/smoke',
      testMatch: '**/*.spec.ts',
      timeout: 60_000,
      use: {
        ...devices['Desktop Chrome'],
        baseURL: SMOKE_BASE_URL,
        actionTimeout: 15_000
      }
    }
  ],
  webServer: {
    command: `"${SMOKE_EXE}"`,
    url: `${SMOKE_BASE_URL}/api/health`,
    timeout: 120_000,
    reuseExistingServer: false,
    env: {
      CARTEIRA_DESKTOP_PORT: String(SMOKE_PORT),
      CARTEIRA_DESKTOP_NO_BROWSER: '1',
      DATABASE_URL,
      ASSET_LOOKUP_MODE: 'fake'
    }
  }
});
