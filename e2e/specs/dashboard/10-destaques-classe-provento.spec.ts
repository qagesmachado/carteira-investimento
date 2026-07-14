import { expect, test } from '../fixtures/test';

import {
  dashboardHighlightsSection,
  gotoDashboardPage
} from '../helpers/dashboardPage';
import { seedDashboardDividendSummary } from '../helpers/seedDashboard';

/**
 * UI-DASH-010 — Destaques classe em destaque e proventos recentes
 * @see ../../../casos-de-uso/ui/dashboard/10-destaques-classe-provento.md
 */
test.describe('UI-DASH-010', () => {
  test.beforeEach(async ({ request }) => {
    await seedDashboardDividendSummary(request);
  });

  test('exibe classe em destaque e proventos recentes com links', async ({ page }) => {
    await gotoDashboardPage(page);

    const highlights = dashboardHighlightsSection(page);
    const featured = highlights.getByTestId('dashboard-highlight-class');
    await expect(featured).toBeVisible();
    await expect(featured.getByText('Classe em destaque')).toBeVisible();
    await expect(featured.getByText('Maior rendimento bruto')).toBeVisible();
    await expect(featured.getByTestId('lucide-icon-ChartPie').first()).toBeVisible();
    await expect(featured.getByTestId('dashboard-featured-class-row-1')).toHaveAttribute(
      'href',
      /\/consolidada/
    );

    const recentDividends = highlights.getByTestId('dashboard-highlight-recent-dividends');
    await expect(recentDividends).toBeVisible();
    await expect(recentDividends.getByText('Proventos recentes')).toBeVisible();
    await expect(recentDividends.getByText('Últimos lançamentos')).toBeVisible();
    await expect(recentDividends.getByTestId('lucide-icon-HandCoins').first()).toBeVisible();
    await expect(recentDividends.getByTestId('dashboard-recent-dividend-row-1')).toBeVisible();

    const dividends12m = page.getByTestId('dashboard-dividends-12m');
    const action = dividends12m.getByTestId('dashboard-dividends-12m-action');
    await expect(action).toBeVisible();
    await expect(action).toHaveText('Ver proventos');
    await expect(action).toHaveAttribute('href', '/proventos');
  });
});
