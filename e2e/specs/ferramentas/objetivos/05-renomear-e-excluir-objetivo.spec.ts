import { expect, test } from '../../fixtures/test';


import {
  createObjectiveViaApi,
  expectDefaultObjectiveFreeQuantity,
  replaceAllocationViaApi,
  seedObjetivosWithStock
} from '../../helpers/seedObjetivos';
import { gotoObjetivosPage, selectObjectiveCard } from '../../helpers/objetivosPage';

/** @see ../../../casos-de-uso/ui/objetivos/05-renomear-e-excluir-objetivo.md */
test.describe('UI-OBJ-005', () => {
  test('excluir objetivo devolve cotas ao Livre', async ({ page, request }) => {
    const { portfolioId, assetId } = await seedObjetivosWithStock(request);
    const objectiveId = await createObjectiveViaApi(request, portfolioId, 'Reserva');
    await replaceAllocationViaApi(request, portfolioId, objectiveId, [
      { slice_name: 'Reserva', asset_id: assetId, quantity: 60 }
    ]);

    await gotoObjetivosPage(page);
    await selectObjectiveCard(page, 'Reserva');
    await page.getByRole('button', { name: 'Renomear' }).click();
    await page.getByTestId('objetivo-name-input').fill('Reserva 2026');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('button', { name: /Reserva 2026/ })).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await page.getByTestId('objetivo-delete-objective-btn').click();

    await expect(page.getByRole('button', { name: /Reserva 2026/ })).toHaveCount(0);
    await expectDefaultObjectiveFreeQuantity(request, portfolioId, 'PETR4', 100);
  });
});
