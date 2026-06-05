import { expect, test } from '../fixtures/test';


import { E2E_PORTFOLIO_AUX } from '../helpers/e2eFixtures';
import {
  acceptDialogs,
  gotoPortfoliosPage,
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
    await seedPortfoliosAuxForRename(request);
  });

  test('renomeia carteira ativa', async ({ page }) => {
    acceptDialogs(page);
    await gotoPortfoliosPage(page);
    await startRenamePortfolio(page);
    await saveRenamePortfolio(page, 'E2E Aux Renomeada');
    await expect(page.getByRole('alert').filter({ hasText: 'Nome da carteira atualizado.' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'E2E Aux Renomeada' })).toBeVisible();
  });
});
