/**
 * UI-AST-010 — Fluxo completo: lookup até listagem (yfinance)
 * @see ../../../casos-de-uso/ui/assets/10-fluxo-completo-lookup-ate-lista.md
 */
import { expect, test } from '../fixtures/test';


import { getWorkerApiBaseUrl } from '../helpers/workerContext';
import { registeredAssetsTable } from '../helpers/assetsPage';
import { E2E_CDB_NAME, TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import {
  expectReviewFormFlexible,
  saveReviewForm,
  searchTicker
} from '../helpers/lookupFlows';
import {
  fillAndSaveManualFixedIncome,
  startManualFixedIncome
} from '../helpers/manualAssetForm';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-010', () => {
  test.beforeEach(async ({ request }) => {
    await assertYfinanceLookupBackend(request);
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
  });

  test('popula catálogo mínimo com ação, ETF internacional e RF', async ({ page }) => {
    test.setTimeout(180_000);

    await gotoAssetsPage(page);

    await searchTicker(page, TICKER_BBSE3, { lookupTimeout: 45_000 });
    await expectReviewFormFlexible(page, TICKER_BBSE3);
    await saveReviewForm(page);

    await searchTicker(page, TICKER_VOO, { lookupTimeout: 45_000 });
    await expectReviewFormFlexible(page, TICKER_VOO);
    await saveReviewForm(page);

    await startManualFixedIncome(page);
    await fillAndSaveManualFixedIncome(page);

    const table = registeredAssetsTable(page);
    await expect(table.locator('tbody tr')).toHaveCount(3);
    await expect(table.locator('tbody tr').filter({ hasText: TICKER_BBSE3 })).toBeVisible();
    await expect(table.locator('tbody tr').filter({ hasText: TICKER_VOO })).toBeVisible();
    await expect(table.locator('tbody tr').filter({ hasText: E2E_CDB_NAME })).toBeVisible();
  });
});
