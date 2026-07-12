import { expect, test } from '../fixtures/test';

import { isApiRebalanceResponse } from '../helpers/apiResponses';
import {
  dashboardHighlightsSection,
  gotoDashboardPage
} from '../helpers/dashboardPage';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';
import { seedDashboardRebalanceTargets } from '../helpers/seedDashboard';

/**
 * UI-DASH-009 — Aderência ao rebalanceamento
 * @see ../../../casos-de-uso/ui/dashboard/09-aderencia-rebalanceamento.md
 */
test.describe('UI-DASH-009', () => {
  test.beforeEach(async ({ request }) => {
    const portfolioId = await seedConsolidadaPrincipal(request);
    await seedDashboardRebalanceTargets(request, portfolioId);
  });

  test('exibe card de aderencia com percentual e botao para rebalanceamento', async ({ page }) => {
    const rebalanceResponse = page.waitForResponse(
      (r) => isApiRebalanceResponse(r) && r.ok()
    );

    await gotoDashboardPage(page);
    await rebalanceResponse;

    const highlights = dashboardHighlightsSection(page);
    const adherence = highlights.getByTestId('dashboard-highlight-adherence');
    await expect(adherence).toBeVisible();
    await expect(adherence.getByText('Aderência ao rebalanceamento')).toBeVisible();
    await expect(adherence.locator('span.font-bold')).toContainText(/%/);
    const action = adherence.getByTestId('dashboard-adherence-action');
    await expect(action).toBeVisible();
    await expect(action).toHaveText('Conferir rebalanceamento');
    await expect(action).toHaveAttribute('href', /\/rebalanceamento/);
  });
});
