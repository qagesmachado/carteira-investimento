import { expect, test } from '../fixtures/test';


import {
  clearTextFilter,
  dataRows,
  filterByText,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-015 — Limpar filtro restaura linhas
 * @see ../../../casos-de-uso/ui/consolidada/15-limpar-filtro-restaura-linhas.md
 */
test.describe('UI-CNS-015', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('limpar busca restaura todas as linhas', async ({ page }) => {
    await gotoConsolidadaPage(page);
    const totalBefore = await dataRows(page).count();
    expect(totalBefore).toBeGreaterThan(1);

    await filterByText(page, 'BBSE');
    await expect(dataRows(page)).not.toHaveCount(totalBefore);

    await clearTextFilter(page);
    await expect(dataRows(page)).toHaveCount(totalBefore);
  });
});
