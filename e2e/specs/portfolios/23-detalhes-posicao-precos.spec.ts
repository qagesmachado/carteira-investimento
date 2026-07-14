import { test } from '../fixtures/test';


import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  clickPositionDetails,
  expectPositionDetailsVisible,
  gotoPortfolioPositions
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalWithBbse3 } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-023 — Detalhes expansíveis com preços unitários
 * @see ../../../casos-de-uso/ui/portfolios/23-detalhes-posicao-precos.md
 */
test.describe('UI-PRT-023', () => {
  let portfolioId = 0;

  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    portfolioId = await seedPortfoliosPrincipalWithBbse3(request);
  });

  test('abre painel com preço médio e cotação em BBSE3', async ({ page }) => {
    await gotoPortfolioPositions(page, portfolioId);
    await clickPositionDetails(page, TICKER_BBSE3);
    await expectPositionDetailsVisible(page, /Preço médio/);
    await expectPositionDetailsVisible(page, /cotação/i);
  });
});
