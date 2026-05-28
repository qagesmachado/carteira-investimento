import { expect, test } from '@playwright/test';

import { gotoObjetivosPage, selectObjectiveCard } from '../helpers/objetivosPage';
import {
  createObjectiveViaApi,
  replaceAllocationViaApi,
  seedObjetivosWithStock
} from '../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/objetivos/10-metricas-custo-lucro.md */
test.describe('UI-OBJ-010', () => {
  test('exibe custo valor e lucro na alocação', async ({ page, request }) => {
    const { portfolioId, assetId } = await seedObjetivosWithStock(request);
    const objectiveId = await createObjectiveViaApi(request, portfolioId, 'Reserva');
    await replaceAllocationViaApi(request, portfolioId, objectiveId, [
      { slice_name: 'Principal', asset_id: assetId, quantity: 50 }
    ]);

    await gotoObjetivosPage(page);
    await selectObjectiveCard(page, 'Reserva');

    const row = page.locator('[data-testid^="objetivo-allocation-"]').first();
    await expect(row).toContainText('Principal');
    await expect(row).toContainText('400');
    await expect(row).toContainText('500');
    await expect(row).toContainText('100');
  });
});
