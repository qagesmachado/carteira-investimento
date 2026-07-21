import { expect, test } from '../fixtures/test';

import { dashboardShortcutBar, gotoDashboardPage } from '../helpers/dashboardPage';
import { seedDashboardActivePortfolioOnly } from '../helpers/seedDashboard';

/**
 * UI-DASH-011 — Atalhos inferiores
 * @see ../../../casos-de-uso/ui/dashboard/11-atalhos-inferiores.md
 */
test.describe('UI-DASH-011', () => {
  test.beforeEach(async ({ request }) => {
    await seedDashboardActivePortfolioOnly(request);
  });

  test('exibe quatro atalhos para consolidada, rebalanceamento, proventos e objetivos', async ({
    page
  }) => {
    await gotoDashboardPage(page);

    const bar = dashboardShortcutBar(page);
    await expect(bar).toBeVisible();
    await expect(bar.getByTestId('dashboard-shortcut-consolidada')).toHaveAttribute(
      'href',
      '/consolidada'
    );
    await expect(bar.getByTestId('dashboard-shortcut-rebalance')).toHaveAttribute(
      'href',
      '/rebalanceamento'
    );
    await expect(bar.getByTestId('dashboard-shortcut-proventos')).toHaveAttribute(
      'href',
      '/proventos'
    );
    await expect(bar.getByTestId('dashboard-shortcut-objetivos')).toHaveAttribute(
      'href',
      '/objetivos'
    );
  });
});
