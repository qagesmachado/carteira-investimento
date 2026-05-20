import { test } from '@playwright/test';

import {
  expectRowHidden,
  expectRowVisible,
  filterByCurrency,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-013 — Filtro por moeda
 * @see ../../../casos-de-uso/ui/consolidada/13-filtro-tipo-moeda.md
 */
test.describe('UI-CNS-013', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('filtra posições em USD', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await filterByCurrency(page, 'USD');
    await expectRowVisible(page, TICKER_VOO);
    await expectRowHidden(page, TICKER_BBSE3);
  });
});
