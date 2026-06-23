import { expect, test } from '../fixtures/test';

import { TICKER_ABTC11 } from '../helpers/e2eFixtures';
import { createAssetViaApi, deleteAssetBySymbolIfExists, gotoAssetsPage } from '../helpers/seedAssets';

/**
 * UI-CRP-001 — Cadastrar ABTC11 com subtipo cripto
 * @see ../../../casos-de-uso/ui/analise/criptomoedas/01-cadastro-abtc11-subtipo-cripto.md
 */
test.describe('UI-CRP-001', () => {
  test.beforeEach(async ({ request }) => {
    await deleteAssetBySymbolIfExists(request, TICKER_ABTC11);
  });

  test('cadastra ABTC11 manual com subtipo Criptomoeda', async ({ page, request }) => {
    await createAssetViaApi(request, {
      symbol: TICKER_ABTC11,
      name: 'ETF Bitcoin',
      asset_type: 'etf',
      market: 'national',
      country: 'BR',
      currency: 'BRL',
      etf_subtype: 'crypto'
    });
    await gotoAssetsPage(page);
    await expect(page.getByRole('cell', { name: TICKER_ABTC11 })).toBeVisible();
  });
});
