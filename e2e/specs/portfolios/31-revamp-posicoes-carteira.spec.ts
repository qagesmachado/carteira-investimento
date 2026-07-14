import { expect, test } from '../fixtures/test';

import { E2E_PORTFOLIO_PRINCIPAL } from '../helpers/e2eFixtures';
import {
  clickBackToPortfoliosHub,
  clickPositionDetails,
  gotoPortfolioPositions
} from '../helpers/portfoliosPage';
import { seedPortfoliosFullMix } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-031 — Revamp visual da página de posições
 * @see ../../../casos-de-uso/ui/portfolios/31-revamp-posicoes-carteira.md
 */
test.describe('UI-PRT-031', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
  });

  test('hero, resumo detailed e tabela enriquecida', async ({ page, request }) => {
    const portfolioId = await seedPortfoliosFullMix(request);
    await gotoPortfolioPositions(page, portfolioId, { portfolioName: E2E_PORTFOLIO_PRINCIPAL });

    await expect(page.getByTestId('page-hero')).toBeVisible();
    await expect(page.getByTestId('portfolio-positions-back')).toBeVisible();
    await expect(page.getByTestId('portfolio-detail-summary')).toBeVisible();
    await expect(page.getByTestId('portfolio-workspace-bar')).toBeVisible();
    await expect(page.getByTestId('dashboard-portfolio-bar')).toBeVisible();
    await expect(page.getByTestId('portfolio-hub-allocation')).toHaveAttribute(
      'data-allocation-variant',
      'inlineMedium'
    );
    await expect(page.getByTestId('portfolio-hub-rebalance-link')).toBeVisible();
    await expect(page.getByTestId('portfolio-positions-section')).toBeVisible();
    await expect(page.getByTestId('portfolio-positions-table')).toBeVisible();

    const firstTickerPill = page.locator('[data-testid^="portfolio-ticker-pill-"]').first();
    await expect(firstTickerPill).toBeVisible();

    const ticker = (await firstTickerPill.textContent())?.trim() ?? '';
    if (ticker) {
      await clickPositionDetails(page, ticker);
      await expect(page.locator('[role="region"]').first()).toBeVisible();
    }

    await clickBackToPortfoliosHub(page);
    await expect(page.getByTestId('portfolio-hub-new')).toBeVisible();
  });
});
