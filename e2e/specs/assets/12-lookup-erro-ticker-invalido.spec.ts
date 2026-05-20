/**
 * UI-AST-012 — Lookup com ticker inválido (yfinance)
 * @see ../../../casos-de-uso/ui/assets/12-lookup-erro-ticker-invalido.md
 */
import { expect, test } from '@playwright/test';

import { API_BASE_URL } from '../helpers/apiResponses';
import { registeredAssetsTable } from '../helpers/assetsPage';
import { TICKER_INVALID } from '../helpers/e2eFixtures';
import { searchInvalidTicker } from '../helpers/lookupFlows';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-012', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllTestAssets(request, API_BASE_URL);
  });

  test('exibe erro e não cadastra ticker inválido', async ({ page }) => {
    test.setTimeout(90_000);

    await gotoAssetsPage(page);
    const rowsBefore = await registeredAssetsTable(page).locator('tbody tr').count();

    await searchInvalidTicker(page, TICKER_INVALID);

    await expect(registeredAssetsTable(page).locator('tbody tr')).toHaveCount(rowsBefore);
  });
});
