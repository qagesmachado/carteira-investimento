import { expect, test } from '../fixtures/test';


import { dividendBulkSection } from '../helpers/dividendBulkImport';
import {
  goToProventosListTab,
  gotoProventosPage,
  paymentsTable,
  selectProventosPortfolio
} from '../helpers/proventosPage';
import { seedProventosSeparacaoPorCarteira } from '../helpers/seedProventos';

/**
 * UI-PRV-017 - Importacao em lote usa a carteira ativa do painel do topo (Proventos > Adicionar)
 * @see ../../../casos-de-uso/ui/proventos/17-import-lote-seletor-carteira.md
 */
test.describe('UI-PRV-017', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosSeparacaoPorCarteira(request);
  });

  test('importacao em lote aplica a carteira do topo a todas as linhas', async ({ page }) => {
    await gotoProventosPage(page);

    // A carteira de destino vem do painel do topo da seção.
    await selectProventosPortfolio(page, 'Carteira B');

    const importSection = dividendBulkSection(page);
    await importSection.getByRole('textbox', { name: 'Conteúdo CSV' }).fill(
      'ticker,data,valor,tipo\nBBSE3,01/07/2024,10,dividend\nBBSE3,02/07/2024,10,dividend'
    );

    await importSection.getByRole('button', { name: 'Pré-visualizar no servidor' }).click();
    await expect(importSection.getByRole('button', { name: /Importar selecionados/ })).toBeVisible();
    await importSection.getByRole('button', { name: /Importar selecionados/ }).click();
    await expect(page.getByRole('alert').filter({ hasText: /Importação concluída/ })).toBeVisible();

    // Ainda na Carteira B (escopo do topo): 1 provento seed + 2 importados.
    await goToProventosListTab(page);
    await expect(paymentsTable(page).locator('tr')).toHaveCount(3);

    // Carteira A não recebe o lote importado.
    await selectProventosPortfolio(page, 'Carteira A');
    await expect(paymentsTable(page).locator('tr')).toHaveCount(1);
  });
});
