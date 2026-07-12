import { expect, test } from '../fixtures/test';


import { isApiQuoteRefreshResponse } from '../helpers/apiResponses';
import {
  allocationSection,
  clickRefreshQuotes,
  gotoDashboardPage
} from '../helpers/dashboardPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-DASH-004 — Alocação por classe (rosca)
 * @see ../../../casos-de-uso/ui/dashboard/04-alocacao-barras-pizza.md
 */
test.describe('UI-DASH-004', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('exibe rosca de alocacao com legenda e total', async ({ page }) => {
    await gotoDashboardPage(page);

    const quotesRefresh = page.waitForResponse(
      (r) => isApiQuoteRefreshResponse(r) && r.ok(),
      { timeout: 60_000 }
    );
    await clickRefreshQuotes(page);
    await quotesRefresh;

    const section = allocationSection(page);
    await expect(section.getByTestId('dashboard-patrimony-filters')).toHaveCount(0);
    await expect(section.getByRole('button', { name: 'Pizza' })).not.toBeVisible();
    await expect(section.locator('svg')).toBeVisible();
    await expect(section.getByTestId('dashboard-allocation-legend')).toBeVisible();
    await expect(section.getByTestId('dashboard-allocation-total')).toContainText('Total');
  });
});
