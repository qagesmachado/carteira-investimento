/**
 * UI-AST-009 — Importação em lote (yfinance) via /dados
 * @see ../../../casos-de-uso/ui/assets/09-importacao-lote.md
 */
import { test } from '../fixtures/test';


import { getWorkerApiBaseUrl } from '../helpers/workerContext';
import { BULK_TICKERS_FAKE } from '../helpers/e2eFixtures';
import {
  expectRegisteredTickers,
  pasteTickersAndPreview,
  saveAllSelectedBulk
} from '../helpers/bulkImport';
import { gotoDadosPage } from '../helpers/dataPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-009', () => {
  test.beforeEach(async ({ request }) => {
    await assertYfinanceLookupBackend(request);
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
  });

  test('importa três tickers em lote pela página Dados', async ({ page }) => {
    test.setTimeout(90_000);

    await gotoDadosPage(page);
    await pasteTickersAndPreview(page, BULK_TICKERS_FAKE.join('\n'), { previewTimeout: 45_000 });
    await saveAllSelectedBulk(page);

    await gotoAssetsPage(page);
    await expectRegisteredTickers(page, [...BULK_TICKERS_FAKE]);
  });
});
