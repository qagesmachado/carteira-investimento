import { expect, test } from '../../fixtures/test';


import {
  createObjectiveViaApi,
  expectDefaultObjectiveFreeQuantity,
  replaceAllocationViaApi,
  seedObjetivosWithStock
} from '../../helpers/seedObjetivos';
import { gotoObjetivosPage, selectObjectiveCard } from '../../helpers/objetivosPage';

/** @see ../../../casos-de-uso/ui/objetivos/12-excluir-alocacao-linha.md */
test.describe('UI-OBJ-012', () => {
  test('remove alocação pela linha e libera cotas', async ({ page, request }) => {
    const { portfolioId, assetId } = await seedObjetivosWithStock(request);
    const objectiveId = await createObjectiveViaApi(request, portfolioId, 'Reserva', {
      mode: 'single_asset',
      partition_asset_id: assetId
    });
    await replaceAllocationViaApi(request, portfolioId, objectiveId, [
      { slice_name: 'Reserva', asset_id: assetId, quantity: 40 }
    ]);

    await gotoObjetivosPage(page);
    await selectObjectiveCard(page, 'Reserva');

    page.once('dialog', (dialog) => dialog.accept());
    await page.locator('[data-testid^="allocation-remove-"]').first().click();

    await expect(page.locator('[data-testid^="objetivo-allocation-"]')).toHaveCount(0);
    await expect(page.getByTestId('objetivo-add-asset-btn')).toBeVisible();

    await expectDefaultObjectiveFreeQuantity(request, portfolioId, 'PETR4', 100);
  });
});
