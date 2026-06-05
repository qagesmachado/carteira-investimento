/**
 * UI-AST-015 — Limpar busca na listagem
 * @see ../../../casos-de-uso/ui/assets/15-listagem-limpar-busca.md
 */
import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import { clearListFilter, filterRegisteredAssets, listFilterInput } from '../helpers/listagem';
import { gotoAssetsPage, seedCatalogForFilter } from '../helpers/seedAssets';

test.describe('UI-AST-015', () => {
  test.beforeEach(async ({ request }) => {
    await seedCatalogForFilter(request);
  });

  test('limpa filtro e restaura listagem completa', async ({ page }) => {
    await gotoAssetsPage(page);

    await filterRegisteredAssets(page, TICKER_BBSE3);
    await expect(page.getByText('1 de 3 ativos', { exact: true })).toBeVisible();

    await clearListFilter(page);
    await expect(listFilterInput(page)).toHaveValue('');
    await expect(page.getByText('3 ativos', { exact: true })).toBeVisible();
  });
});
