import { expect, test } from '../../fixtures/test';


import { gotoFinanciamentoImovelPage } from '../../helpers/financiamentoImovelPage';
import { seedPropertyFinancingEmpty } from '../../helpers/seedPropertyFinancing';

/** @see ../../../../casos-de-uso/ui/ferramentas/financiamento-imovel/README.md UI-FERR-001 */
test.describe('UI-FERR-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedPropertyFinancingEmpty(request);
  });

  test('exibe resumo vazio na carteira seed', async ({ page }) => {
    await gotoFinanciamentoImovelPage(page);
    await expect(page.getByTestId('financing-summary')).toBeVisible();
    await expect(page.getByTestId('financing-tab-resumo')).toHaveClass(/btn-primary/);
    await expect(page.getByText(/Nenhum financiamento cadastrado/)).toBeVisible();
    await expect(page.getByTestId('summary-profit')).toContainText('R$');
  });
});
