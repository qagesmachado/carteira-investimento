import { expect, test } from '../fixtures/test';


import {
  gotoProventosPage,
  paymentsListSection,
  paymentsTable
} from '../helpers/proventosPage';
import { gotoDadosPage } from '../helpers/dataPage';
import { seedProventosSeparacaoPorCarteira } from '../helpers/seedProventos';

/**
 * UI-PRV-017 - Importacao em lote aplica a carteira selecionada (/dados)
 * @see ../../../casos-de-uso/ui/proventos/17-import-lote-seletor-carteira.md
 */
test.describe('UI-PRV-017', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosSeparacaoPorCarteira(request);
  });

  test('seletor de carteira na importacao aplica a todas as linhas do lote', async ({ page }) => {
    await gotoDadosPage(page);

    const importSection = page
      .getByTestId('dados-proventos')
      .locator('section')
      .filter({ has: page.getByRole('heading', { name: 'Proventos em lote' }) });

    await importSection
      .getByLabel('Carteira de destino da importacao em lote')
      .selectOption({ label: 'Carteira B' });

    await importSection.getByRole('textbox', { name: 'Conteúdo CSV' }).fill(
      'ticker,data,valor,tipo\nBBSE3,01/07/2024,10,dividend\nBBSE3,02/07/2024,10,dividend'
    );

    await importSection.getByRole('button', { name: 'Pré-visualizar no servidor' }).click();
    await expect(importSection.getByRole('button', { name: /Importar selecionados/ })).toBeVisible();
    await importSection.getByRole('button', { name: /Importar selecionados/ }).click();
    await expect(importSection.getByText(/Importação concluída/)).toBeVisible();

    const section = paymentsListSection(page);
    await gotoProventosPage(page);
    await section.getByLabel('Filtrar por carteira').selectOption({ label: 'Carteira B' });
    await expect(paymentsTable(page).locator('tr')).toHaveCount(3);

    await section.getByLabel('Filtrar por carteira').selectOption({ label: 'Carteira A' });
    await expect(paymentsTable(page).locator('tr')).toHaveCount(1);
  });
});
