import { test } from '../fixtures/test';


import {
  clickPositionDetails,
  expectPositionDetailsVisible,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { TICKER_BTC_USD } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaBitcoinWithFee } from '../helpers/seedConsolidadaBitcoin';

/**
 * UI-CNS-018 — Detalhes BTC com lucro após taxas
 * @see ../../../casos-de-uso/ui/consolidada/18-detalhes-btc-lucro-taxas.md
 */
test.describe('UI-CNS-018', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaBitcoinWithFee(request);
  });

  test('exibe Lucro − taxas no painel de detalhes do BTC', async ({ page }) => {
    const snapshotResponse = page.waitForResponse(
      (r) =>
        (r.url().includes('/crypto-snapshot') || r.url().includes('/bitcoin-snapshot')) && r.ok()
    );
    await gotoConsolidadaPage(page);
    await snapshotResponse;
    await clickPositionDetails(page, TICKER_BTC_USD);
    await expectPositionDetailsVisible(page, /Lucro − taxas/);
    await expectPositionDetailsVisible(page, /Taxas pagas/i);
  });
});
