import { test } from '@playwright/test';

import {
  expectRowHidden,
  expectRowVisible,
  filterByText,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-005 — Filtro por texto na consolidada
 * @see ../../../casos-de-uso/ui/consolidada/05-filtro-texto-busca.md
 */
test.describe('UI-CNS-005', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('filtra tabela por texto BBSE', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await filterByText(page, 'BBSE');
    await expectRowVisible(page, TICKER_BBSE3);
    await expectRowHidden(page, TICKER_VOO);
  });
});
