import { expect, test } from '../fixtures/test';


import {
  expectRowVisible,
  filterByDisplayClass,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-014 — Filtro classe Nacional
 * @see ../../../casos-de-uso/ui/consolidada/14-filtro-classe-nacional.md
 */
test.describe('UI-CNS-014', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('filtro Nacional mantém ativos nacionais e oculta VOO', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await filterByDisplayClass(page, 'Nacional');
    await expectRowVisible(page, TICKER_BBSE3);
    await expect(page.locator('table tbody tr').filter({ hasText: TICKER_VOO })).toHaveCount(0);
  });
});
