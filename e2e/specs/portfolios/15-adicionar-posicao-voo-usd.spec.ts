import { expect, test } from '../fixtures/test';


import { E2E_PORTFOLIO_PRINCIPAL, TICKER_VOO } from '../helpers/e2eFixtures';
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
 * UI-PRT-015 — Adicionar posição VOO (USD)
 * @see ../../../casos-de-uso/ui/portfolios/15-adicionar-posicao-voo-usd.md
 */
test.describe('UI-PRT-015', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosPrincipalOnly(request);
  });

  test('adiciona posição em USD', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await createPortfolioViaUI(page, E2E_PORTFOLIO_PRINCIPAL);
    await pickAssetInAddForm(page, TICKER_VOO);
    await fillMarketPosition(page, { quantity: '5', avgPrice: '400' });
    await clickAddPosition(page);
    await expectPositionRow(page, TICKER_VOO);
    await expect(page.getByText('Moeda do ativo: Dólar (USD)')).toBeVisible();
  });
});
