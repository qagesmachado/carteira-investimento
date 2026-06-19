/**
 * UI-AST-010 — Fluxo completo: lookup até listagem (yfinance)
 * @see ../../../casos-de-uso/ui/assets/10-fluxo-completo-lookup-ate-lista.md
 */
import { expect, test } from '../fixtures/test';


import { getWorkerApiBaseUrl } from '../helpers/workerContext';
import { registeredAssetsTable } from '../helpers/assetsPage';
import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import {
  expectReviewFormFlexible,
  saveReviewForm,
  searchTicker
} from '../helpers/lookupFlows';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-010', () => {
  test.beforeEach(async ({ request }) => {
    await assertYfinanceLookupBackend(request);
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
  });

  test('popula catálogo de mercado com ação e ETF internacional', async ({ page }) => {
    test.setTimeout(180_000);

    await gotoAssetsPage(page);

    await searchTicker(page, TICKER_BBSE3, { lookupTimeout: 45_000 });
    await expectReviewFormFlexible(page, TICKER_BBSE3);
    await saveReviewForm(page);

    await searchTicker(page, TICKER_VOO, { lookupTimeout: 45_000 });
    await expectReviewFormFlexible(page, TICKER_VOO);
    await saveReviewForm(page);

    const table = registeredAssetsTable(page);
    await expect(table.locator('tbody tr')).toHaveCount(2);
    await expect(table.locator('tbody tr').filter({ hasText: TICKER_BBSE3 })).toBeVisible();
    await expect(table.locator('tbody tr').filter({ hasText: TICKER_VOO })).toBeVisible();

    // Renda fixa/previdência não são mais cadastradas em /assets.
    await expect(page.getByRole('button', { name: 'Nova renda fixa' })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Nova previdência' })).toHaveCount(0);
  });
});
