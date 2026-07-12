import { expect, test } from '../fixtures/test';


import { isApiFxRefreshResponse } from '../helpers/apiResponses';
import { clickRefreshFx, dashboardFxBadge, dashboardQuotesBadge, gotoDashboardPage } from '../helpers/dashboardPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-DASH-006 — Atualizar câmbio USD/BRL
 * @see ../../../casos-de-uso/ui/dashboard/06-atualizar-cambio-usd-brl.md
 */
test.describe('UI-DASH-006', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('atualiza taxa USD/BRL via rede', async ({ page }) => {
    await gotoDashboardPage(page);

    const fxRefresh = page.waitForResponse(
      (r) => isApiFxRefreshResponse(r) && r.ok(),
      { timeout: 60_000 }
    );
    await clickRefreshFx(page);
    await fxRefresh;

    await expect(
      page.getByRole('alert').filter({ hasText: /Câmbio USD\/BRL atualizado|USD\/BRL/ })
    ).toBeVisible({ timeout: 15_000 });
    await expect(dashboardFxBadge(page)).toContainText(/USD\/BRL \d/);
  });
});
