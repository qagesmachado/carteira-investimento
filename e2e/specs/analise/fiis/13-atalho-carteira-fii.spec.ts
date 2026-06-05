import { expect, test } from '../../fixtures/test';


import { analysisPanel, clickClassificarInPortfolios } from '../../helpers/analisePage';
import { TICKER_HGLG11 } from '../../helpers/e2eFixtures';
import { seedAnalysisWithFii } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-013 — Atalho carteira Classificar FII
 * @see ../../../casos-de-uso/ui/analise/fiis/13-atalho-carteira-fii.md
 */
test.describe('UI-ANL-013', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithFii(request);
  });

  test('abre painel FII pela carteira', async ({ page }) => {
    await page.goto('/portfolios');
    await clickClassificarInPortfolios(page, TICKER_HGLG11);
    await expect(analysisPanel(page)).toContainText(TICKER_HGLG11);
    await expect(analysisPanel(page).getByRole('tab', { name: 'Viabilidade' })).toBeVisible();
  });
});
