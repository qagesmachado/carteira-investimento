import { expect, test } from '../../fixtures/test';


import {
  createFinancingUi,
  gotoFinanciamentoImovelPage,
  selectFinancingTab
} from '../../helpers/financiamentoImovelPage';
import { seedPropertyFinancingEmpty } from '../../helpers/seedPropertyFinancing';

/** @see ../../../../casos-de-uso/ui/ferramentas/financiamento-imovel/README.md UI-FERR-002 */
test.describe('UI-FERR-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedPropertyFinancingEmpty(request);
  });

  test('cria financiamento com tipo de imóvel', async ({ page }) => {
    await gotoFinanciamentoImovelPage(page);
    await createFinancingUi(page, {
      name: 'Casa Praia',
      propertyType: 'casa'
    });
    await expect(page.getByTestId('financing-detail')).toBeVisible();
    await expect(page.getByTestId('financing-event-form')).toBeVisible();
    await selectFinancingTab(page, 'Resumo');
    await expect(page.getByTestId('financing-summary')).toContainText('Casa Praia');
    await expect(page.getByRole('cell', { name: 'Casa', exact: true })).toBeVisible();
  });
});
