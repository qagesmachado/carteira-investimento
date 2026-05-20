/**
 * UI-AST-009 — Importação em lote (yfinance)
 * @see ../../../casos-de-uso/ui/assets/09-importacao-lote.md
 */
import { test } from '@playwright/test';

import { API_BASE_URL } from '../helpers/apiResponses';
import { BULK_TICKERS_FAKE } from '../helpers/e2eFixtures';
import {
  expectRegisteredTickers,
  pasteTickersAndPreview,
  saveAllSelectedBulk
} from '../helpers/bulkImport';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-009', () => {
  test.beforeEach(async ({ request }) => {
    await assertYfinanceLookupBackend(request);
    await clearAllTestAssets(request, API_BASE_URL);
  });

  test('importa três tickers em lote', async ({ page }) => {
    test.setTimeout(90_000);

    await gotoAssetsPage(page);
    await pasteTickersAndPreview(page, BULK_TICKERS_FAKE.join('\n'), { previewTimeout: 45_000 });
    await saveAllSelectedBulk(page);
    await expectRegisteredTickers(page, [...BULK_TICKERS_FAKE]);
  });
});
