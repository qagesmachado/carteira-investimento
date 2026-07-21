import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import {
  filterByDateRange,
  gotoProventosListPage,
  paymentsTable
} from '../helpers/proventosPage';
import { seedProventosMultiForFilters } from '../helpers/seedProventos';

/**
 * UI-PRV-010 — Filtrar por período de datas
 * @see ../../../casos-de-uso/ui/proventos/10-filtro-periodo-datas.md
 */
test.describe('UI-PRV-010', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosMultiForFilters(request);
  });

  test('restringe lançamentos ao intervalo informado', async ({ page }) => {
    await gotoProventosListPage(page);

    await filterByDateRange(page, '01/03/2024', '31/07/2024');
    await expect(paymentsTable(page).locator('tr')).toHaveCount(2);
    await expect(paymentsTable(page).locator('tr').filter({ hasText: TICKER_BBSE3 })).toHaveCount(1);
    await expect(paymentsTable(page).locator('tr').filter({ hasText: TICKER_VOO })).toHaveCount(1);
  });
});
