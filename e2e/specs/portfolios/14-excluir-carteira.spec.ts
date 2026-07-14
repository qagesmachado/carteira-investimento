import { expect, test } from '../fixtures/test';


import { E2E_PORTFOLIO_PRINCIPAL } from '../helpers/e2eFixtures';
import {
  acceptDialogs,
  deleteActivePortfolio,
  gotoPortfolioPositions
} from '../helpers/portfoliosPage';
import { seedPortfoliosAuxForRename } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-014 — Excluir carteira
 * @see ../../../casos-de-uso/ui/portfolios/14-excluir-carteira.md
 */
test.describe('UI-PRT-014', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
  });

  test('exclui carteira ativa e retorna ao hub', async ({ page, request }) => {
    acceptDialogs(page);
    const portfolioId = await seedPortfoliosAuxForRename(request);
    await gotoPortfolioPositions(page, portfolioId);
    await deleteActivePortfolio(page);
    await expect(page.getByText('Nenhuma carteira ainda')).toBeVisible();
    await expect(page).toHaveURL(/\/portfolios$/);
  });
});
