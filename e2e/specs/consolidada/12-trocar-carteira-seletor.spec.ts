import { test } from '../fixtures/test';


import {
  E2E_PORTFOLIO_SECONDARY,
  expectPortfolioSelectShows,
  expectRowVisible,
  gotoConsolidadaPage,
  selectPortfolioByName
} from '../helpers/consolidadaPage';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaTwoPortfolios } from '../helpers/seedConsolidada';

/**
 * UI-CNS-012 — Trocar carteira no seletor
 * @see ../../../casos-de-uso/ui/consolidada/12-trocar-carteira-seletor.md
 */
test.describe('UI-CNS-012', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaTwoPortfolios(request);
  });

  test('troca para carteira secundária no seletor', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await selectPortfolioByName(page, E2E_PORTFOLIO_SECONDARY);
    await expectPortfolioSelectShows(page, E2E_PORTFOLIO_SECONDARY);
    await expectRowVisible(page, TICKER_BBSE3);
  });
});
