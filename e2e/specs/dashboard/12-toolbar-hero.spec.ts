import { expect, test } from '../fixtures/test';

import { dashboardFxBadge, dashboardQuotesBadge, gotoDashboardPage } from '../helpers/dashboardPage';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-DASH-012 — Toolbar do hero
 * @see ../../../casos-de-uso/ui/dashboard/12-toolbar-hero.md
 */
test.describe('UI-DASH-012', () => {
  test.beforeEach(async ({ request }) => {
    await seedConsolidadaPrincipal(request);
  });

  test('exibe acoes de cotacoes e cambio no canto direito do hero', async ({ page }) => {
    await gotoDashboardPage(page);

    const row = page.getByTestId('page-hero').locator(':scope > div').first();
    const actions = page.getByTestId('page-hero-actions');
    await expect(page.getByTestId('dashboard-refresh-quotes')).toBeVisible();
    await expect(page.getByTestId('dashboard-refresh-fx')).toBeVisible();
    await expect(page.getByTestId('dashboard-toggle-hide-values')).toHaveCount(0);
    await expect(row).toHaveClass(/justify-between/);
    await expect(row).toHaveClass(/items-center/);
    await expect(actions).not.toHaveClass(/flex-col/);
    await expect(page.getByRole('heading', { name: 'Dashboard', level: 1 })).toBeVisible();
    await expect(page.getByText(/atualizado/i)).toHaveCount(0);
    await expect(dashboardFxBadge(page)).toContainText(/USD\/BRL/);
    await expect(dashboardQuotesBadge(page)).toContainText(/Cotações ·/);
  });
});
