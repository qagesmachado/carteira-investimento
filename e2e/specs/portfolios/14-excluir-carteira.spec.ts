import { expect, test } from '../fixtures/test';


import { E2E_PORTFOLIO_AUX } from '../helpers/e2eFixtures';
import { acceptDialogs, deleteActivePortfolio, gotoPortfoliosPage } from '../helpers/portfoliosPage';
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
    await seedPortfoliosAuxForRename(request);
  });

  test('exclui carteira ativa', async ({ page }) => {
    acceptDialogs(page);
    await gotoPortfoliosPage(page);
    await expect(page.getByRole('button', { name: E2E_PORTFOLIO_AUX })).toBeVisible();
    await deleteActivePortfolio(page);
    await expect(page.getByText('Nenhuma carteira ainda.')).toBeVisible();
    await expect(page.getByRole('button', { name: E2E_PORTFOLIO_AUX })).toHaveCount(0);
  });
});
