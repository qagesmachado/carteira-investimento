import { test as base, expect } from '@playwright/test';

import { setWorkerEnv, type WorkerEnv } from '../helpers/workerContext';

const { getWorkerEnv, E2E_WORKER_COUNT } = require('../../worker-env');

type WorkerFixtures = {
  workerEnv: WorkerEnv;
  apiBaseUrl: string;
};

export const test = base.extend<WorkerFixtures>({
  workerEnv: [
    async ({}, use, workerInfo) => {
      // workerIndex cresce quando o Playwright recicla processos; mapear para slots de servidor.
      const slot = workerInfo.workerIndex % E2E_WORKER_COUNT;
      const env = getWorkerEnv(slot) as WorkerEnv;
      setWorkerEnv(env);
      await use(env);
    },
    { scope: 'worker' }
  ],

  apiBaseUrl: [
    async ({ workerEnv }, use) => {
      await use(workerEnv.apiBaseUrl);
    },
    { scope: 'worker' }
  ],

  request: async ({ playwright, workerEnv }, use) => {
    setWorkerEnv(workerEnv);
    const requestContext = await playwright.request.newContext({
      baseURL: workerEnv.apiBaseUrl
    });
    await use(requestContext);
    await requestContext.dispose();
  },

  page: async ({ browser, workerEnv }, use) => {
    setWorkerEnv(workerEnv);
    const context = await browser.newContext({ baseURL: workerEnv.frontendBaseUrl });
    const page = await context.newPage();
    await use(page);
    await context.close();
  }
});

export { expect };
