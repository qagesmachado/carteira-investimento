import { expect, test } from '../fixtures/test';

import { E2E_PORTFOLIO_AUX } from '../helpers/e2eFixtures';
import {
  acceptDialogs,
  deletePortfolioFromHub,
  gotoPortfoliosHub
} from '../helpers/portfoliosPage';
import { seedPortfoliosAuxForRename } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-029 — Excluir carteira pelo hub
 * @see ../../../casos-de-uso/ui/portfolios/29-excluir-carteira-hub.md
 */
test.describe('UI-PRT-029', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
  });

  test('exclui carteira auxiliar pelo card com confirmação', async ({ page, request }) => {
    acceptDialogs(page);
    await seedPortfoliosAuxForRename(request);
    await gotoPortfoliosHub(page);

    const auxName = E2E_PORTFOLIO_AUX;
    await expect(page.getByTestId('portfolio-hub-card').filter({ hasText: auxName })).toBeVisible();
    await deletePortfolioFromHub(page, auxName);
    await expect(page.getByTestId('portfolio-hub-card').filter({ hasText: auxName })).toHaveCount(0);
    await expect(page).toHaveURL(/\/portfolios$/);
  });
});
