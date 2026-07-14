import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import { analysisPanel, clickClassificarInPortfolios } from '../helpers/analisePage';
import { gotoPortfolioPositions } from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalWithBbse3 } from '../helpers/seedPortfolios';

/**
 * UI-ANL-005 — Atalho Classificar na carteira
 * @see ../../../casos-de-uso/ui/analise/05-atalho-carteira-classificar.md
 */
test.describe('UI-ANL-005', () => {
  let portfolioId = 0;

  test.beforeEach(async ({ request }) => {
    portfolioId = await seedPortfoliosPrincipalWithBbse3(request);
  });

  test('abre painel de análise a partir da carteira', async ({ page }) => {
    await gotoPortfolioPositions(page, portfolioId);
    await clickClassificarInPortfolios(page, TICKER_BBSE3);
    await expect(analysisPanel(page)).toContainText(TICKER_BBSE3);
  });
});
