import { expect, test } from '../../fixtures/test';

import { getWorkerApiBaseUrl } from '../../helpers/workerContext';
import { clearAllTestAssets, createAssetViaApi } from '../../helpers/seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from '../../helpers/testPortfolios';
import {
  createObjectiveViaApi,
  getAllocationIdBySliceName,
  patchAllocationPurposeViaApi,
  replaceAllocationViaApi
} from '../../helpers/seedObjetivos';
import { E2E_PORTFOLIO_PRINCIPAL } from '../../helpers/e2eFixtures';
import { gotoObjetivosPage, selectObjectiveCard } from '../../helpers/objetivosPage';

/** @see ../../../casos-de-uso/ui/objetivos/18-finalidade-rebalanceamento-reserva.md */
test.describe('UI-OBJ-018', () => {
  test('fatia de reserva sai do rebalanceamento e aparece no controle de patrimônio', async ({
    page,
    request
  }) => {
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
    await clearAllPortfolios(request);

    await createAssetViaApi(request, {
      symbol: 'AUPO11',
      name: 'ETF RF AUPO11',
      asset_type: 'etf',
      market: 'national',
      country: 'BR',
      currency: 'BRL',
      etf_subtype: 'fixed_income',
      current_quote: 100
    });

    const assetId = await getAssetIdBySymbol(request, 'AUPO11');
    const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
    await createPosition(request, portfolio.id, assetId, { quantity: 100, average_price: 100 });
    await setActivePortfolio(request, portfolio.id);

    const objectiveId = await createObjectiveViaApi(request, portfolio.id, 'AUPO11', {
      mode: 'single_asset',
      partition_asset_id: assetId
    });

    await replaceAllocationViaApi(request, portfolio.id, objectiveId, [
      { slice_name: 'Investimento', asset_id: assetId, quantity: 60 },
      { slice_name: 'Reserva', asset_id: assetId, quantity: 40 }
    ]);

    const reserveAllocationId = await getAllocationIdBySliceName(
      request,
      portfolio.id,
      objectiveId,
      'Reserva'
    );
    await patchAllocationPurposeViaApi(request, portfolio.id, objectiveId, reserveAllocationId, {
      is_emergency_reserve: true
    });

    const rebalance = await request.get(
      `${getWorkerApiBaseUrl()}/portfolios/${portfolio.id}/rebalance`
    );
    expect(rebalance.ok()).toBeTruthy();
    const rebalanceBody = await rebalance.json();
    const rf = rebalanceBody.classes.find(
      (row: { display_class: string }) => row.display_class === 'fixed_income'
    );
    expect(rf.current_value_brl).toBe(6000);

    await page.goto('/rebalanceamento');
    await expect(page.getByRole('heading', { name: 'Rebalanceamento', exact: true })).toBeVisible();
    await expect(page.getByText('R$ 6.000,00').first()).toBeVisible();

    await page.goto('/controle-patrimonio');
    await expect(
      page.getByRole('heading', { name: 'Controle de patrimônio', exact: true })
    ).toBeVisible();
    await expect(page.getByTestId('patrimony-emergency-section')).toBeVisible();
    const linkedRow = page
      .getByTestId('patrimony-emergency-section')
      .getByTestId('linked-reserve-row-' + assetId);
    await expect(linkedRow).toBeVisible();
    await expect(linkedRow).toContainText('AUPO11');
    await expect(linkedRow).toContainText('objetivos financeiros');
    await expect(page.getByTestId(`linked-reserve-link-${assetId}`)).toBeVisible();
    await expect(page.getByTestId('summary-emergency')).toHaveText('R$ 4.000,00');

    await gotoObjetivosPage(page);
    await selectObjectiveCard(page, 'AUPO11');
    await expect(page.getByTestId(`allocation-purpose-${reserveAllocationId}`)).toBeVisible();
    await expect(page.getByTestId(`emergency-reserve-${reserveAllocationId}`)).toBeChecked();
    const investAllocationId = await getAllocationIdBySliceName(
      request,
      portfolio.id,
      objectiveId,
      'Investimento'
    );
    await expect(page.getByTestId(`emergency-reserve-${investAllocationId}`)).not.toBeChecked();
  });
});
