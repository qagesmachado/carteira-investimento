import { expect, test } from '@playwright/test';

import { isApiQuoteRefreshResponse } from '../helpers/apiResponses';
import { clickRefreshQuotes, gotoDashboardPage } from '../helpers/dashboardPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-DASH-005 — Atualizar cotações
 * @see ../../../casos-de-uso/ui/dashboard/05-atualizar-cotacoes.md
 */
test.describe('UI-DASH-005', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('exibe resumo após refresh de cotações', async ({ page }) => {
    await gotoDashboardPage(page);

    const quotesRefresh = page.waitForResponse(
      (r) => isApiQuoteRefreshResponse(r) && r.ok(),
      { timeout: 60_000 }
    );
    await clickRefreshQuotes(page);
    await quotesRefresh;

    await expect(
      page.getByRole('alert').filter({ hasText: /Cotações atualizadas/ })
    ).toBeVisible({ timeout: 15_000 });
  });
});
