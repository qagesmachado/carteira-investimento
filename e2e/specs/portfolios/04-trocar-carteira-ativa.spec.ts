import { test } from '../fixtures/test';


import { E2E_PORTFOLIO_SECONDARY } from '../helpers/e2eFixtures';
import {
  expectPortfolioActive,
  gotoPortfolioPositions,
  selectPortfolioByName
} from '../helpers/portfoliosPage';
import { seedPortfoliosTwoPortfolios } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-004 — Trocar carteira ativa
 * @see ../../../casos-de-uso/ui/portfolios/04-trocar-carteira-ativa.md
 */
test.describe('UI-PRT-004', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
  });

  test('ativa carteira secundária pelo seletor', async ({ page, request }) => {
    const { principalId } = await seedPortfoliosTwoPortfolios(request);
    await gotoPortfolioPositions(page, principalId);
    await selectPortfolioByName(page, E2E_PORTFOLIO_SECONDARY);
    await expectPortfolioActive(page, E2E_PORTFOLIO_SECONDARY);
  });
});
