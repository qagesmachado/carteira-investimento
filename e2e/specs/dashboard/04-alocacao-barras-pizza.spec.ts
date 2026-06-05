import { expect, test } from '../fixtures/test';


import { isApiQuoteRefreshResponse } from '../helpers/apiResponses';
import {
  allocationSection,
  clickRefreshQuotes,
  gotoDashboardPage,
  switchAllocationView
} from '../helpers/dashboardPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-DASH-004 — Alocação Barras/Pizza
 * @see ../../../casos-de-uso/ui/dashboard/04-alocacao-barras-pizza.md
 */
test.describe('UI-DASH-004', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('alterna alocação entre barras e pizza', async ({ page }) => {
    await gotoDashboardPage(page);

    const quotesRefresh = page.waitForResponse(
      (r) => isApiQuoteRefreshResponse(r) && r.ok(),
      { timeout: 60_000 }
    );
    await clickRefreshQuotes(page);
    await quotesRefresh;

    const section = allocationSection(page);
    await expect(section.getByRole('button', { name: 'Pizza' })).toBeVisible();
    await switchAllocationView(page, 'Pizza');
    await expect(section.locator('svg')).toBeVisible();
    await switchAllocationView(page, 'Barras');
    await expect(section.locator('.rounded-full.bg-base-200 .h-full').first()).toBeVisible();
  });
});
