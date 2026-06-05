import { expect, test } from '../fixtures/test';


import { E2E_PORTFOLIO_PRINCIPAL } from '../helpers/e2eFixtures';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  clickAddPosition,
  createPortfolioViaUI,
  fillMarketPosition,
  gotoPortfoliosPage,
  pickAssetInAddForm,
  expectPositionRow
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalOnly } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-005 — Adicionar posição de mercado BRL
 * @see ../../../casos-de-uso/ui/portfolios/05-adicionar-posicao-mercado-brl.md
 */
test.describe('UI-PRT-005', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosPrincipalOnly(request);
  });

  test('adiciona posição BBSE3 com preço BR', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await createPortfolioViaUI(page, E2E_PORTFOLIO_PRINCIPAL);
    await pickAssetInAddForm(page, TICKER_BBSE3);
    await fillMarketPosition(page, { quantity: '100', avgPrice: '32,50' });
    await clickAddPosition(page);
    await expectPositionRow(page, TICKER_BBSE3);

    await page.reload();
    await expectPositionRow(page, TICKER_BBSE3);
  });
});
