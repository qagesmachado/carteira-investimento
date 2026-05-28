import { expect, test } from '@playwright/test';

import { API_BASE_URL } from '../helpers/apiResponses';
import {
  createObjectiveViaApi,
  replaceAllocationViaApi,
  seedObjetivosWithStock
} from '../helpers/seedObjetivos';
import {
  gotoObjetivosPage,
  openAddAssetModal,
  pickAssetInModal,
  selectObjectiveCard
} from '../helpers/objetivosPage';

/** @see ../../../casos-de-uso/ui/objetivos/07-bloqueio-edicao-com-divergencia.md */
test.describe('UI-OBJ-007', () => {
  test('bloqueia alocação enquanto há divergência', async ({ page, request }) => {
    const { portfolioId, assetId } = await seedObjetivosWithStock(request, 'PETR4', 100);
    const reservaId = await createObjectiveViaApi(request, portfolioId, 'Reserva');
    await replaceAllocationViaApi(request, portfolioId, reservaId, [
      { slice_name: 'Reserva', asset_id: assetId, quantity: 60 }
    ]);

    const positionsResponse = await request.get(`${API_BASE_URL}/portfolios/${portfolioId}/positions`);
    const positions = (await positionsResponse.json()) as { id: number; asset_id: number }[];
    const position = positions.find((p) => p.asset_id === assetId)!;
    await request.patch(`${API_BASE_URL}/portfolios/${portfolioId}/positions/${position.id}`, {
      data: { quantity: 50 }
    });

    await gotoObjetivosPage(page);
    await selectObjectiveCard(page, 'Reserva');
    await openAddAssetModal(page);
    await pickAssetInModal(page, 'PETR4');
    await expect(page.getByTestId('allocation-blocked-message')).toBeVisible();
    await expect(page.getByTestId('allocation-save-btn')).toBeDisabled();
  });
});
