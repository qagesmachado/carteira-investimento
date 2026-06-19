/**
 * UI-AST-011 — Dispensar alerta na página
 * @see ../../../casos-de-uso/ui/assets/11-dispensar-alerta.md
 */
import { test } from '../fixtures/test';


import { getWorkerApiBaseUrl } from '../helpers/workerContext';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import {
  dismissAlert,
  expectReviewFormFlexible,
  saveReviewForm,
  searchTicker
} from '../helpers/lookupFlows';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-011', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
  });

  test('fecha alerta de sucesso após salvar', async ({ page }) => {
    await gotoAssetsPage(page);
    await searchTicker(page, TICKER_BBSE3, { lookupTimeout: 45_000 });
    await expectReviewFormFlexible(page, TICKER_BBSE3);
    await saveReviewForm(page);
    await dismissAlert(page);
  });
});
