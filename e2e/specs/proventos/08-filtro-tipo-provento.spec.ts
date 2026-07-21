import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import {
  filterByType,
  gotoProventosListPage,
  paymentsTable
} from '../helpers/proventosPage';
import { seedProventosMultiForFilters } from '../helpers/seedProventos';

/**
 * UI-PRV-008 — Filtrar por tipo de provento
 * @see ../../../casos-de-uso/ui/proventos/08-filtro-tipo-provento.md
 */
test.describe('UI-PRV-008', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosMultiForFilters(request);
  });

  test('mostra apenas lançamentos do tipo selecionado', async ({ page }) => {
    await gotoProventosListPage(page);

    await filterByType(page, 'JCP');
    await expect(paymentsTable(page).locator('tr')).toHaveCount(1);
    await expect(paymentsTable(page).locator('tr')).toContainText('JCP');
    await expect(paymentsTable(page).locator('tr').filter({ hasText: TICKER_VOO })).toHaveCount(0);
    await expect(paymentsTable(page).locator('tr').filter({ hasText: TICKER_BBSE3 })).toHaveCount(1);
  });
});
