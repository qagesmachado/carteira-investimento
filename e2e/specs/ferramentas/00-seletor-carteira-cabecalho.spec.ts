import { expect, test } from '../fixtures/test';

import { E2E_PORTFOLIO_PRINCIPAL, E2E_PORTFOLIO_SECONDARY } from '../helpers/e2eFixtures';
import {
  FERRAMENTAS_HEADER_PORTFOLIO_ROUTES,
  PORTFOLIO_SELECT_HEADER_TEST_ID,
  expectHeaderPortfolioSelectVisible,
  gotoFerramentaPage,
  headerPortfolioSelect,
  selectHeaderPortfolioByName
} from '../helpers/ferramentasPage';
import { seedObjetivosEmpty } from '../helpers/seedObjetivos';
import { seedPropertyFinancingTwoPortfolios } from '../helpers/seedPropertyFinancing';

/** @see ../../casos-de-uso/ui/ferramentas/00-seletor-carteira-cabecalho.md */
test.describe('UI-FERR-000', () => {
  for (const { route, heading } of FERRAMENTAS_HEADER_PORTFOLIO_ROUTES) {
    test(`${route} exibe seletor de carteira no cabeçalho`, async ({ page }) => {
      await gotoFerramentaPage(page, route, heading);
    });
  }

  test('seletor do cabeçalho lista carteira ativa após seed', async ({ page, request }) => {
    await seedObjetivosEmpty(request);
    await gotoFerramentaPage(page, '/ferramentas/objetivos', 'Objetivos financeiros');
    await expect(headerPortfolioSelect(page)).toContainText(E2E_PORTFOLIO_PRINCIPAL);
  });

  test('cálculo de preço médio mantém um único seletor no cabeçalho fora da aba Carteira', async ({
    page
  }) => {
    await gotoFerramentaPage(page, '/ferramentas/calculo-preco-medio', 'Cálculo de preço médio');
    await expectHeaderPortfolioSelectVisible(page);
    await page.getByTestId('tab-portfolio').click();
    await expect(page.getByTestId('portfolio-lot-form')).toBeVisible();
    await expect(page.getByTestId(PORTFOLIO_SELECT_HEADER_TEST_ID)).toHaveCount(1);
  });

  test('carteira ativa persiste ao navegar entre ferramentas', async ({ page, request }) => {
    await seedPropertyFinancingTwoPortfolios(request);
    await gotoFerramentaPage(page, '/ferramentas/financiamento-imovel', 'Financiamento imóvel');
    await expect(headerPortfolioSelect(page)).toContainText(E2E_PORTFOLIO_PRINCIPAL);

    const activeResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/portfolios/active') &&
        response.request().method() === 'PUT' &&
        response.ok()
    );
    await selectHeaderPortfolioByName(page, E2E_PORTFOLIO_SECONDARY);
    await activeResponse;

    await gotoFerramentaPage(page, '/ferramentas/calculo-preco-medio', 'Cálculo de preço médio');
    await expect(headerPortfolioSelect(page)).toContainText(E2E_PORTFOLIO_SECONDARY);

    await gotoFerramentaPage(page, '/ferramentas/objetivos', 'Objetivos financeiros');
    await expect(headerPortfolioSelect(page)).toContainText(E2E_PORTFOLIO_SECONDARY);
  });
});
