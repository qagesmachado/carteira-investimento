import { expect, test } from '../fixtures/test';


import {
  E2E_PORTFOLIO_PRINCIPAL,
  expectPortfolioSelectShows,
  expectRowVisible,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';

/**
 * UI-CNS-002 — Seletor de carteira ativa
 * @see ../../../casos-de-uso/ui/consolidada/02-seletor-carteira-ativa.md
 */
test.describe('UI-CNS-002', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('carteira ativa aparece no seletor e posições na tabela', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await expectPortfolioSelectShows(page, E2E_PORTFOLIO_PRINCIPAL);
    await expectRowVisible(page, TICKER_BBSE3);
  });
});
