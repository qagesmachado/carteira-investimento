import { expect, test } from '../fixtures/test';


import {
  filterByTickerText,
  gotoProventosPage,
  paymentsListSection
} from '../helpers/proventosPage';
import { seedProventosMultiForFilters } from '../helpers/seedProventos';

/**
 * UI-PRV-012 — Listagem vazia após filtro
 * @see ../../../casos-de-uso/ui/proventos/12-listagem-vazia-apos-filtro.md
 */
test.describe('UI-PRV-012', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosMultiForFilters(request);
  });

  test('exibe mensagem quando nenhum lançamento corresponde', async ({ page }) => {
    await gotoProventosPage(page);

    await filterByTickerText(page, 'TICKER_INEXISTENTE_XYZ');
    await expect(
      paymentsListSection(page).getByText('Nenhum provento corresponde aos filtros aplicados.')
    ).toBeVisible();
  });
});
