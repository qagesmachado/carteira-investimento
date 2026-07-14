import { expect, test } from '../fixtures/test';


import { E2E_PORTFOLIO_PRINCIPAL } from '../helpers/e2eFixtures';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  expectHubPortfolioCardMetrics,
  gotoPortfoliosHub
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalWithBbse3 } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-025 — Hub exibe cards com KPIs
 * @see ../../../casos-de-uso/ui/portfolios/25-hub-cards-metricas.md
 */
test.describe('UI-PRT-025', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosPrincipalWithBbse3(request);
  });

  test('card da carteira exibe totais aplicado, atual e lucro', async ({ page }) => {
    await gotoPortfoliosHub(page);
    await expectHubPortfolioCardMetrics(page, E2E_PORTFOLIO_PRINCIPAL);
  });
});
