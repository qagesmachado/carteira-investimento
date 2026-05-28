import { expect, test } from '@playwright/test';

import { gotoObjetivosPage } from '../helpers/objetivosPage';
import {
  createObjectiveViaApi,
  replaceAllocationViaApi,
  seedObjetivosWithStock
} from '../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/objetivos/11-objetivo-single-asset-particao.md */
test.describe('UI-OBJ-011', () => {
  test('resumo mostra partição unificada do ativo', async ({ page, request }) => {
    const { portfolioId, assetId } = await seedObjetivosWithStock(request);
    const viagemId = await createObjectiveViaApi(request, portfolioId, 'Viagem', {
      mode: 'single_asset',
      partition_asset_id: assetId
    });
    const reservaId = await createObjectiveViaApi(request, portfolioId, 'Reserva', {
      mode: 'single_asset',
      partition_asset_id: assetId
    });
    await replaceAllocationViaApi(request, portfolioId, viagemId, [
      { slice_name: 'Viagem', asset_id: assetId, quantity: 30 }
    ]);
    await replaceAllocationViaApi(request, portfolioId, reservaId, [
      { slice_name: 'Reserva', asset_id: assetId, quantity: 40 }
    ]);

    await gotoObjetivosPage(page);
    const card = page.getByTestId(`partition-card-${assetId}`);
    await expect(card).toBeVisible();
    await expect(card).toContainText('Viagem');
    await expect(card).toContainText('Reserva');
    await expect(card).toContainText('Restante');
    await expect(card).toContainText('30');
    await expect(card.locator('tbody tr').filter({ hasText: /^Livre$/ })).toHaveCount(0);
  });
});
