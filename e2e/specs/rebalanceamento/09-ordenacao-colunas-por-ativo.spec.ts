import { expect, test } from '@playwright/test';

import {
  assetRebalanceDataRows,
  clickAssetRebalanceColumnSort,
  gotoRebalancePage
} from '../helpers/rebalancePage';
import { seedRebalanceTwoStocksScored } from '../helpers/seedRebalance';

/**
 * UI-REB-009 — Ordenação de colunas na tabela Por ativo
 * @see ../../../casos-de-uso/ui/rebalanceamento/09-ordenacao-colunas-por-ativo.md
 */
test.describe('UI-REB-009', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceTwoStocksScored(request);
  });

  test('ordena coluna Ticker ao clicar no cabeçalho', async ({ page }) => {
    await gotoRebalancePage(page);
    const rows = assetRebalanceDataRows(page);
    await expect(rows).toHaveCount(2);

    await clickAssetRebalanceColumnSort(page, 'Ticker');
    const firstAsc = (await rows.first().locator('td').first().innerText()).trim();

    await clickAssetRebalanceColumnSort(page, 'Ticker');
    const firstDesc = (await rows.first().locator('td').first().innerText()).trim();

    expect(firstAsc).not.toBe(firstDesc);
  });
});
