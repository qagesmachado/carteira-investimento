import { expect, test } from '../../fixtures/test';


import {
  createObjectiveUi,
  gotoObjetivosPage,
  fillAllocationInModal,
  openAddAssetModal,
  selectObjectiveCard
} from '../../helpers/objetivosPage';
import { expectDefaultObjectiveFreeQuantity, seedObjetivosWithStock } from '../../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/objetivos/03-alocar-ativo-cotas.md */
test.describe('UI-OBJ-003', () => {
  test('aloca 60 cotas PETR4 em Reserva', async ({ page, request }) => {
    const { portfolioId } = await seedObjetivosWithStock(request);
    await gotoObjetivosPage(page);
    await createObjectiveUi(page, 'Reserva Emergência');
    await selectObjectiveCard(page, 'Reserva Emergência');
    await openAddAssetModal(page);
    await fillAllocationInModal(page, {
      sliceName: 'Reserva',
      shares: '60',
      symbol: 'PETR4'
    });

    await selectObjectiveCard(page, 'Reserva Emergência');
    await expect(page.getByTestId('objetivo-detail')).toContainText('60');

    await expectDefaultObjectiveFreeQuantity(request, portfolioId, 'PETR4', 40);
  });
});
