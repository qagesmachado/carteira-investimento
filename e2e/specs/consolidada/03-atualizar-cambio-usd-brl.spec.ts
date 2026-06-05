import { expect, test } from '../fixtures/test';


import { isApiFxRefreshResponse } from '../helpers/apiResponses';
import { clickRefreshFx, gotoConsolidadaPage } from '../helpers/consolidadaPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-003 — Atualizar câmbio USD/BRL
 * @see ../../../casos-de-uso/ui/consolidada/03-atualizar-cambio-usd-brl.md
 */
test.describe('UI-CNS-003', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('atualiza taxa USD/BRL via rede', async ({ page }) => {
    await gotoConsolidadaPage(page);

    const fxRefresh = page.waitForResponse(
      (r) => isApiFxRefreshResponse(r) && r.ok(),
      { timeout: 60_000 }
    );
    await clickRefreshFx(page);
    await fxRefresh;

    await expect(
      page.getByRole('alert').filter({ hasText: /Câmbio USD\/BRL atualizado|USD\/BRL/ })
    ).toBeVisible({ timeout: 15_000 });
    await expect(page.getByText(/USD\/BRL:/)).toBeVisible();
  });
});
