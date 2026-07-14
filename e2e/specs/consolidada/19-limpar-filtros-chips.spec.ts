import { test } from '../fixtures/test';

import {
  clearConsolidadaFilters,
  expectRowHidden,
  expectRowVisible,
  filterByText,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-019 — Limpar filtros e chips
 * @see ../../../casos-de-uso/ui/consolidada/19-limpar-filtros-chips.md
 */
test.describe('UI-CNS-019', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('limpar filtros restaura todas as posições visíveis', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await filterByText(page, 'BBSE');
    await expectRowVisible(page, TICKER_BBSE3);
    await expectRowHidden(page, TICKER_VOO);

    await clearConsolidadaFilters(page);
    await expectRowVisible(page, TICKER_BBSE3);
    await expectRowVisible(page, TICKER_VOO);
  });
});
