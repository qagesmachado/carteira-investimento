/**
 * UI-AST-014 — Ticker duplicado no cadastro (yfinance)
 * @see ../../../casos-de-uso/ui/assets/14-ticker-duplicado.md
 */
import { expect, test } from '../fixtures/test';


import { registeredAssetsTable } from '../helpers/assetsPage';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import {
  expectReviewFormFlexible,
  saveReviewFormExpectDuplicate,
  searchTicker
} from '../helpers/lookupFlows';
import { gotoAssetsPage, seedBbse3 } from '../helpers/seedAssets';

test.describe('UI-AST-014', () => {
  test.beforeEach(async ({ request }) => {
    await assertYfinanceLookupBackend(request);
    await seedBbse3(request);
  });

  test('impede cadastrar ticker já existente', async ({ page }) => {
    test.setTimeout(90_000);

    await gotoAssetsPage(page);
    const countBefore = await registeredAssetsTable(page).locator('tbody tr').count();

    await searchTicker(page, TICKER_BBSE3, { lookupTimeout: 45_000 });
    await expectReviewFormFlexible(page, TICKER_BBSE3);
    await saveReviewFormExpectDuplicate(page);

    await expect(registeredAssetsTable(page).locator('tbody tr')).toHaveCount(countBefore);
  });
});
