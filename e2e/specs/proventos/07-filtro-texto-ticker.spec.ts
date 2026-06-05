import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import {
  expectPaymentsCounter,
  filterByTickerText,
  gotoProventosPage,
  paymentsTable
} from '../helpers/proventosPage';
import { seedProventosMultiForFilters } from '../helpers/seedProventos';

/**
 * UI-PRV-007 — Filtrar por ticker ou nome
 * @see ../../../casos-de-uso/ui/proventos/07-filtro-texto-ticker.md
 */
test.describe('UI-PRV-007', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosMultiForFilters(request);
  });

  test('filtra linhas pelo ticker digitado', async ({ page }) => {
    await gotoProventosPage(page);

    await filterByTickerText(page, TICKER_BBSE3);
    await expectPaymentsCounter(page, /2 de 3 lançamentos/);
    await expect(paymentsTable(page).locator('tr').filter({ hasText: TICKER_BBSE3 })).toHaveCount(2);
    await expect(paymentsTable(page).locator('tr').filter({ hasText: TICKER_VOO })).toHaveCount(0);
  });
});
