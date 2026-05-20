/**
 * UI-AST-006 — Listagem com busca e filtro
 * @see ../../../casos-de-uso/ui/assets/06-listagem-busca-filtro.md
 */
import { expect, test } from '@playwright/test';

import { TICKER_BBSE3, TICKER_PETR4 } from '../helpers/e2eFixtures';
import {
  clearListFilter,
  expectBadgeShowsFiltered,
  expectFilteredRowCount,
  filterRegisteredAssets
} from '../helpers/listagem';
import { gotoAssetsPage, seedCatalogForFilter } from '../helpers/seedAssets';

test.describe('UI-AST-006', () => {
  test.beforeEach(async ({ request }) => {
    await seedCatalogForFilter(request);
  });

  test('filtra ativos por ticker ou nome', async ({ page }) => {
    await gotoAssetsPage(page);

    await filterRegisteredAssets(page, TICKER_BBSE3);
    await expectFilteredRowCount(page, TICKER_BBSE3, 1);
    await expectFilteredRowCount(page, TICKER_PETR4, 0);
    await expectBadgeShowsFiltered(page, 1, 3);

    await clearListFilter(page);
    await expect(page.locator('section').filter({ hasText: 'Ativos cadastrados' }).locator('tbody tr')).toHaveCount(3);
  });
});
