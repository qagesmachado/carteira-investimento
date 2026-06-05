import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import {
  filterByMarket,
  gotoProventosPage,
  paymentsTable
} from '../helpers/proventosPage';
import { seedProventosMultiForFilters } from '../helpers/seedProventos';

/**
 * UI-PRV-009 — Filtrar por mercado
 * @see ../../../casos-de-uso/ui/proventos/09-filtro-mercado.md
 */
test.describe('UI-PRV-009', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosMultiForFilters(request);
  });

  test('mostra apenas proventos do mercado internacional', async ({ page }) => {
    await gotoProventosPage(page);

    await filterByMarket(page, 'Internacional');
    await expect(paymentsTable(page).locator('tr')).toHaveCount(1);
    await expect(paymentsTable(page).locator('tr')).toContainText(TICKER_VOO);
    await expect(paymentsTable(page).locator('tr').filter({ hasText: TICKER_BBSE3 })).toHaveCount(0);
  });
});
