import { expect, test } from '../fixtures/test';

import {
  dividends12MonthSection,
  gotoDashboardPage
} from '../helpers/dashboardPage';
import { seedDashboardDividendSummary } from '../helpers/seedDashboard';

/**
 * UI-DASH-008 — Gráfico proventos no ano corrente
 * @see ../../../casos-de-uso/ui/dashboard/08-proventos-painel-visao.md
 */
test.describe('UI-DASH-008', () => {
  test.beforeEach(async ({ request }) => {
    await seedDashboardDividendSummary(request);
  });

  test('exibe barras de janeiro a dezembro com totais e comparacao anual', async ({ page }) => {
    await gotoDashboardPage(page);

    const section = dividends12MonthSection(page);
    const year = new Date().getFullYear();
    await expect(
      section.getByRole('heading', { name: `Proventos no ano ${year}` })
    ).toBeVisible();
    await expect(section.getByTestId('dashboard-dividends-year-chart')).toBeVisible();
    const monthLabels = section.getByTestId('dashboard-dividends-year-month-labels');
    await expect(monthLabels.getByText('Jan', { exact: true })).toBeVisible();
    await expect(monthLabels.getByText('Dez', { exact: true })).toBeVisible();
    await expect(section.getByTestId('dashboard-dividends-year-total')).toBeVisible();
    await expect(section.getByTestId('dashboard-dividends-year-comparison')).toContainText(
      `Ano anterior (${year - 1})`
    );
    await expect(section.locator('.rounded-t.bg-success[style*="height"]')).not.toHaveCount(0);

    const action = section.getByTestId('dashboard-dividends-12m-action');
    await expect(action).toBeVisible();
    await expect(action).toHaveText('Ver proventos');
    await expect(action).toHaveAttribute('href', '/proventos');
  });
});
