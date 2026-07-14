import { expect, test } from '../fixtures/test';


import { E2E_PORTFOLIO_AUX } from '../helpers/e2eFixtures';
import {
  acceptDialogs,
  gotoPortfolioPositions,
  saveRenamePortfolio,
  startRenamePortfolio
} from '../helpers/portfoliosPage';
import { seedPortfoliosAuxForRename } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-003 — Renomear carteira
 * @see ../../../casos-de-uso/ui/portfolios/03-renomear-carteira.md
 */
test.describe('UI-PRT-003', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
  });

  test('renomeia carteira ativa', async ({ page, request }) => {
    acceptDialogs(page);
    const portfolioId = await seedPortfoliosAuxForRename(request);
    await gotoPortfolioPositions(page, portfolioId);
    await startRenamePortfolio(page);
    await saveRenamePortfolio(page, 'E2E Aux Renomeada');
    await expect(page.getByRole('alert').filter({ hasText: 'Carteira atualizada.' })).toBeVisible();
    await expect(
      page.locator('[data-testid="portfolio-positions-select"] option:checked')
    ).toHaveText('E2E Aux Renomeada');
  });
});
