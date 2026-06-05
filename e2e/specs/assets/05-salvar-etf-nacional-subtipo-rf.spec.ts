/**
 * UI-AST-005 — Salvar ETF nacional com subtipo renda fixa (yfinance)
 * @see ../../../casos-de-uso/ui/assets/05-salvar-etf-nacional-subtipo-rf.md
 */
import { test } from '../fixtures/test';


import { TICKER_AUVP11 } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import {
  expectReviewFormFlexible,
  saveEtfWithSubtypeRf,
  searchTicker
} from '../helpers/lookupFlows';
import { deleteAssetBySymbolIfExists, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-005', () => {
  test.beforeEach(async ({ request }) => {
    await assertYfinanceLookupBackend(request);
    await deleteAssetBySymbolIfExists(request, TICKER_AUVP11);
  });

  test('cadastra AUVP11 como ETF de renda fixa', async ({ page }) => {
    test.setTimeout(90_000);

    await gotoAssetsPage(page);
    await searchTicker(page, TICKER_AUVP11, { lookupTimeout: 45_000 });
    await expectReviewFormFlexible(page, TICKER_AUVP11);
    await saveEtfWithSubtypeRf(page, TICKER_AUVP11);
  });
});
