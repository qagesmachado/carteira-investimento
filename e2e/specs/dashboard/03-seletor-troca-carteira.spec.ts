import { expect, test } from '../fixtures/test';


import {
  dashboardPortfolioSelect,
  gotoDashboardPage,
  waitForPositionsAfterPortfolioChange
} from '../helpers/dashboardPage';
import { E2E_PORTFOLIO_SECONDARY } from '../helpers/e2eFixtures';
import { seedConsolidadaTwoPortfolios } from '../helpers/seedConsolidada';

/**
 * UI-DASH-003 — Seletor de carteira
 * @see ../../../casos-de-uso/ui/dashboard/03-seletor-troca-carteira.md
 */
test.describe('UI-DASH-003', () => {
  test.beforeEach(async ({ request }) => {
    await seedConsolidadaTwoPortfolios(request);
  });

  test('troca carteira e atualiza posições ativas', async ({ page }) => {
    await gotoDashboardPage(page);

    await expect(
      page.locator('.stat').filter({ hasText: 'Posições ativas' }).getByText('4')
    ).toBeVisible();

    const changePromise = waitForPositionsAfterPortfolioChange(page);
    await dashboardPortfolioSelect(page).selectOption({ label: E2E_PORTFOLIO_SECONDARY });
    await changePromise;

    await expect(
      page.locator('.stat').filter({ hasText: 'Posições ativas' }).getByText('1')
    ).toBeVisible();
  });
});
