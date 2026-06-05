import { expect, test } from '../../fixtures/test';


import {
  createObjectiveViaApi,
  expectDefaultObjectiveHasNoAllocations,
  replaceAllocationViaApi,
  seedObjetivosWithRf
} from '../../helpers/seedObjetivos';
import { gotoObjetivosPage } from '../../helpers/objetivosPage';

/** @see ../../../casos-de-uso/ui/ferramentas/objetivos/04-alocar-ativo-valor-rf.md */
test.describe('UI-OBJ-004', () => {
  test('divide CDB R$ 100k entre dois objetivos', async ({ page, request }) => {
    const { portfolioId, assetId } = await seedObjetivosWithRf(request);
    const obj1 = await createObjectiveViaApi(request, portfolioId, 'Objetivo 1');
    const obj2 = await createObjectiveViaApi(request, portfolioId, 'Objetivo 2');
    await replaceAllocationViaApi(request, portfolioId, obj1, [
      { slice_name: 'Parte 1', asset_id: assetId, amount: 50_000 }
    ]);
    await replaceAllocationViaApi(request, portfolioId, obj2, [
      { slice_name: 'Parte 2', asset_id: assetId, amount: 50_000 }
    ]);

    await gotoObjetivosPage(page);
    await expect(page.getByTestId('objetivos-summary')).toBeVisible();
    await expectDefaultObjectiveHasNoAllocations(request, portfolioId);
  });
});
