import { test } from '../fixtures/test';


import { E2E_CDB_IDENTIFIER } from '../helpers/e2eFixtures';
import { expectNoClassificarInRow } from '../helpers/analisePage';
import { gotoPortfolioPositions } from '../helpers/portfoliosPage';
import { seedPortfoliosWithRfPosition } from '../helpers/seedPortfolios';

/**
 * UI-ANL-006 — Sem botão Classificar para RF/FII
 * @see ../../../casos-de-uso/ui/analise/06-sem-botao-rf-fii.md
 */
test.describe('UI-ANL-006', () => {
  let portfolioId = 0;

  test.beforeEach(async ({ request }) => {
    portfolioId = await seedPortfoliosWithRfPosition(request);
  });

  test('linha de RF manual não exibe Classificar', async ({ page }) => {
    await gotoPortfolioPositions(page, portfolioId);
    await expectNoClassificarInRow(page, E2E_CDB_IDENTIFIER);
  });
});
