import { expect, test } from '../fixtures/test';


import {
  gotoProventosListPage,
  paymentsTable,
  selectProventosPortfolio
} from '../helpers/proventosPage';
import { seedProventosSeparacaoPorCarteira } from '../helpers/seedProventos';

/**
 * UI-PRV-016 - Painel de carteira no topo filtra a listagem de proventos
 * @see ../../../casos-de-uso/ui/proventos/16-filtro-carteira-listagem.md
 */
test.describe('UI-PRV-016', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosSeparacaoPorCarteira(request);
  });

  test('painel de carteira troca o escopo da listagem, com default na ativa', async ({ page }) => {
    await gotoProventosListPage(page);

    // Carteira A é a ativa do seed; a lista já abre nela.
    const rows = paymentsTable(page).locator('tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Carteira A');
    await expect(rows.first()).toContainText('R$ 50,00');

    // Troca a carteira pelo painel do topo.
    await selectProventosPortfolio(page, 'Carteira B');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Carteira B');
    await expect(rows.first()).toContainText('R$ 12,00');
  });
});
