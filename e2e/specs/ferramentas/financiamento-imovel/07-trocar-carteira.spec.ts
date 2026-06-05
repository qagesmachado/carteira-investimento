import { expect, test } from '../../fixtures/test';


import {
  gotoFinanciamentoImovelPage,
  selectPortfolioByName
} from '../../helpers/financiamentoImovelPage';
import { E2E_PORTFOLIO_PRINCIPAL, E2E_PORTFOLIO_SECONDARY } from '../../helpers/e2eFixtures';
import { seedPropertyFinancingTwoPortfolios } from '../../helpers/seedPropertyFinancing';

/** @see ../../../../casos-de-uso/ui/ferramentas/financiamento-imovel/README.md UI-FERR-007 */
test.describe('UI-FERR-007', () => {
  test.beforeEach(async ({ request }) => {
    await seedPropertyFinancingTwoPortfolios(request);
  });

  test('trocar carteira exibe financiamentos distintos', async ({ page }) => {
    await gotoFinanciamentoImovelPage(page);
    await expect(page.getByRole('button', { name: /Apto Seed/ })).toBeVisible();

    await selectPortfolioByName(page, E2E_PORTFOLIO_SECONDARY);
    await expect(page.getByText(/Nenhum financiamento cadastrado/)).toBeVisible();

    await selectPortfolioByName(page, E2E_PORTFOLIO_PRINCIPAL);
    await expect(page.getByTestId('financing-summary')).toContainText('Apto Seed');
  });
});
