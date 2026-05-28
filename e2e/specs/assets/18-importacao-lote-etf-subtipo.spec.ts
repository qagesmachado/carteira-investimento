/**
 * UI-AST-018 — Lote com ETF nacional e subtipo RF (yfinance)
 * @see ../../../casos-de-uso/ui/assets/18-importacao-lote-etf-subtipo.md
 */
import { expect, test } from '@playwright/test';

import { API_BASE_URL } from '../helpers/apiResponses';
import { registeredAssetsTable } from '../helpers/assetsPage';
import { TICKER_AUPO11 } from '../helpers/e2eFixtures';
import {
  pasteTickersAndPreview,
  saveAllSelectedBulk,
  setBulkEtfSubtypeRf
} from '../helpers/bulkImport';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { gotoDadosPage } from '../helpers/dataPage';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-018', () => {
  test.beforeEach(async ({ request }) => {
    await assertYfinanceLookupBackend(request);
    await clearAllTestAssets(request, API_BASE_URL);
  });

  test('informa subtipo RF na prévia do lote e salva ETF', async ({ page }) => {
    test.setTimeout(90_000);

    await gotoDadosPage(page);
    await pasteTickersAndPreview(page, TICKER_AUPO11, { previewTimeout: 45_000 });
    await setBulkEtfSubtypeRf(page, TICKER_AUPO11);
    await saveAllSelectedBulk(page);

    await gotoAssetsPage(page);
    const row = registeredAssetsTable(page).locator('tbody tr').filter({ hasText: TICKER_AUPO11 });
    await expect(row).toHaveCount(1);
    await expect(row).toContainText('ETF');
  });
});
