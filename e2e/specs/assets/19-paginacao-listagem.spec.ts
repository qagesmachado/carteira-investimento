/**
 * UI-AST-019 — Paginação da listagem de ativos
 * @see ../../../casos-de-uso/ui/assets/19-paginacao-listagem.md
 */
import { expect, test } from '../fixtures/test';


import { registeredAssetsPagination, registeredAssetsTable } from '../helpers/assetsPage';
import { gotoAssetsPage, seedManyAssetsForPagination } from '../helpers/seedAssets';

test.describe('UI-AST-019', () => {
  test.beforeEach(async ({ request }) => {
    await seedManyAssetsForPagination(request, 25);
  });

  test('pagina tabela de ativos cadastrados', async ({ page }) => {
    await gotoAssetsPage(page);

    await expect(registeredAssetsPagination(page)).toContainText('Mostrando 1–20 de 25');
    await expect(registeredAssetsTable(page).locator('tbody tr')).toHaveCount(20);
    await expect(registeredAssetsTable(page).locator('tbody tr').first()).toContainText('E2E-PAG-01');

    await registeredAssetsPagination(page).getByRole('button', { name: 'Próxima' }).click();

    await expect(registeredAssetsPagination(page)).toContainText('Mostrando 21–25 de 25');
    await expect(registeredAssetsTable(page).locator('tbody tr')).toHaveCount(5);
    await expect(registeredAssetsTable(page).locator('tbody tr').first()).toContainText('E2E-PAG-21');
    await expect(registeredAssetsTable(page).locator('tbody tr').last()).toContainText('E2E-PAG-25');
  });
});
