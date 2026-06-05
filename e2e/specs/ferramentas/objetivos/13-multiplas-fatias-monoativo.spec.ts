import { expect, test } from '../../fixtures/test';


import {
  createObjectiveViaApi,
  replaceAllocationViaApi,
  seedObjetivosWithStock
} from '../../helpers/seedObjetivos';
import { gotoObjetivosPage, selectObjectiveCard } from '../../helpers/objetivosPage';

/** @see ../../../casos-de-uso/ui/ferramentas/objetivos/13-multiplas-fatias-monoativo.md */
test.describe('UI-OBJ-013', () => {
  test('adiciona duas fatias do mesmo ativo com nomes distintos', async ({ page, request }) => {
    const { portfolioId, assetId } = await seedObjetivosWithStock(request, 'AUPO11');
    const objectiveId = await createObjectiveViaApi(request, portfolioId, 'Caixinhas', {
      mode: 'single_asset',
      partition_asset_id: assetId
    });
    await replaceAllocationViaApi(request, portfolioId, objectiveId, [
      { slice_name: 'Viagem', asset_id: assetId, quantity: 10 }
    ]);

    await gotoObjetivosPage(page);
    await selectObjectiveCard(page, 'Caixinhas');
    await expect(page.getByText('Viagem')).toBeVisible();

    await page.getByTestId('objetivo-add-asset-btn').click();
    await page.getByTestId('allocation-slice-name-input').fill('Reserva');
    await page.getByTestId('allocation-shares-input').fill('15');
    await page.getByTestId('allocation-save-btn').click();

    await expect(page.getByText('Reserva')).toBeVisible();
    await expect(page.locator('[data-testid^="objetivo-allocation-"]')).toHaveCount(2);
  });
});
