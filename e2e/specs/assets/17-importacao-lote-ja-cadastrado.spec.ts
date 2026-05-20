/**
 * UI-AST-017 — Lote com ticker já cadastrado (yfinance)
 * @see ../../../casos-de-uso/ui/assets/17-importacao-lote-ja-cadastrado.md
 */
import { test } from '@playwright/test';

import { TICKER_BBSE3, TICKER_KLBN } from '../helpers/e2eFixtures';
import {
  expectPreviewRowStatus,
  expectRegisteredTickers,
  pasteTickersAndPreview,
  saveAllSelectedBulk
} from '../helpers/bulkImport';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { gotoAssetsPage, seedBbse3 } from '../helpers/seedAssets';

test.describe('UI-AST-017', () => {
  test.beforeEach(async ({ request }) => {
    await assertYfinanceLookupBackend(request);
    await seedBbse3(request);
  });

  test('marca BBSE3 como já cadastrado e importa KLBN4', async ({ page }) => {
    test.setTimeout(90_000);

    await gotoAssetsPage(page);
    await pasteTickersAndPreview(page, `${TICKER_BBSE3}\n${TICKER_KLBN}`, { previewTimeout: 45_000 });

    await expectPreviewRowStatus(page, TICKER_BBSE3, 'Já cadastrado');
    await expectPreviewRowStatus(page, TICKER_KLBN, 'Pronto');

    await saveAllSelectedBulk(page);
    await expectRegisteredTickers(page, [TICKER_BBSE3, TICKER_KLBN]);
  });
});
