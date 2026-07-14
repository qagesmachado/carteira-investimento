import { expect, test } from '../fixtures/test';

import {
  E2E_PENSION_IDENTIFIER,
  TICKER_BBSE3
} from '../helpers/e2eFixtures';
import {
  expectRowHidden,
  expectRowVisible,
  gotoConsolidadaPage,
  toggleConsolidadaPensionFilter
} from '../helpers/consolidadaPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaWithPension } from '../helpers/seedConsolidada';

/**
 * UI-CNS-020 — Previdência excluída por padrão
 * @see ../../../casos-de-uso/ui/consolidada/20-filtro-previdencia-padrao.md
 */
test.describe('UI-CNS-020', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaWithPension(request);
  });

  test('oculta previdência por padrão e inclui ao marcar checkbox', async ({ page }) => {
    await gotoConsolidadaPage(page);

    await expect(page.getByTestId('consolidada-patrimony-filters')).toBeVisible();
    await expect(page.getByTestId('consolidada-filter-pension')).toBeVisible();
    await expectRowVisible(page, TICKER_BBSE3);
    await expectRowHidden(page, E2E_PENSION_IDENTIFIER);

    await toggleConsolidadaPensionFilter(page, true);
    await expectRowVisible(page, E2E_PENSION_IDENTIFIER);
  });
});
