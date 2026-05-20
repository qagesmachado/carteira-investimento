import { test } from '@playwright/test';

import {
  expectRowHidden,
  expectRowVisible,
  filterByAssetType,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { TICKER_AUVP11, TICKER_BBSE3, E2E_CDB_NAME } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaForRfFilter } from '../helpers/seedConsolidada';

/**
 * UI-CNS-006 — Filtro Renda fixa inclui ETF de RF
 * @see ../../../casos-de-uso/ui/consolidada/06-filtro-renda-fixa-inclui-etf-rf.md
 */
test.describe('UI-CNS-006', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaForRfFilter(request);
  });

  test('filtro Renda fixa mantém ETF RF e RF manual', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await filterByAssetType(page, 'Renda fixa');
    await expectRowVisible(page, TICKER_AUVP11);
    await expectRowVisible(page, E2E_CDB_NAME);
    await expectRowHidden(page, TICKER_BBSE3);
  });
});
