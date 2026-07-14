import { expect, test } from '../fixtures/test';


import { clickRefreshQuotes, gotoPortfolioPositions } from '../helpers/portfoliosPage';
import { seedPortfoliosFullMix } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-009 — Atualizar cotações
 * @see ../../../casos-de-uso/ui/portfolios/09-atualizar-cotacoes.md
 */
test.describe('UI-PRT-009', () => {
  let portfolioId = 0;

  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    portfolioId = await seedPortfoliosFullMix(request);
  });

  test('exibe resumo após refresh de cotações', async ({ page }) => {
    await gotoPortfolioPositions(page, portfolioId);
    await clickRefreshQuotes(page);
    await expect(
      page.getByRole('alert').filter({ hasText: /Cotações atualizadas/ })
    ).toBeVisible({ timeout: 15_000 });
  });
});
