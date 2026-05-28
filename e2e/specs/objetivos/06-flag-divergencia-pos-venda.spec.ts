import { expect, test } from '@playwright/test';

import { API_BASE_URL } from '../helpers/apiResponses';
import {
  createObjectiveViaApi,
  replaceAllocationViaApi,
  seedObjetivosWithStock
} from '../helpers/seedObjetivos';
import { gotoObjetivosPage } from '../helpers/objetivosPage';

/** @see ../../../casos-de-uso/ui/objetivos/06-flag-divergencia-pos-venda.md */
test.describe('UI-OBJ-006', () => {
  test('exibe banner após reduzir posição', async ({ page, request }) => {
    const { portfolioId, assetId } = await seedObjetivosWithStock(request, 'PETR4', 100);
    const objectiveId = await createObjectiveViaApi(request, portfolioId, 'Reserva');
    await replaceAllocationViaApi(request, portfolioId, objectiveId, [
      { slice_name: 'Reserva', asset_id: assetId, quantity: 60 }
    ]);

    const positionsResponse = await request.get(`${API_BASE_URL}/portfolios/${portfolioId}/positions`);
    const positions = (await positionsResponse.json()) as { id: number; asset_id: number }[];
    const position = positions.find((p) => p.asset_id === assetId)!;
    await request.patch(`${API_BASE_URL}/portfolios/${portfolioId}/positions/${position.id}`, {
      data: { quantity: 50 }
    });

    await gotoObjetivosPage(page);
    await expect(page.getByTestId('objetivos-divergence-banner')).toBeVisible();
    await expect(page.getByTestId('objetivos-divergence-banner')).toContainText('PETR4');
    await expect(page.getByTestId('objetivos-divergence-banner')).toContainText('removidas');
  });
});
