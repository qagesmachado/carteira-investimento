import { expect, type APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import { E2E_PORTFOLIO_PRINCIPAL } from './e2eFixtures';
import { clearAllTestAssets, createAssetViaApi } from './seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from './testPortfolios';

export async function seedObjetivosEmpty(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedObjetivosWithStock(
  request: APIRequestContext,
  symbol = 'PETR4',
  quantity = 100
): Promise<{ portfolioId: number; assetId: number }> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);

  await createAssetViaApi(request, {
    symbol,
    name: `Ativo ${symbol}`,
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    current_quote: 10
  });

  const assetId = await getAssetIdBySymbol(request, symbol);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await createPosition(request, portfolio.id, assetId, { quantity, average_price: 8 });
  await setActivePortfolio(request, portfolio.id);
  return { portfolioId: portfolio.id, assetId };
}

export async function seedObjetivosWithRf(
  request: APIRequestContext,
  currentValue = 100_000
): Promise<{ portfolioId: number; assetId: number }> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);

  await createAssetViaApi(request, {
    symbol: 'CDB-OBJ-E2E',
    name: 'CDB Objetivos',
    asset_type: 'fixed_income',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });

  const assetId = await getAssetIdBySymbol(request, 'CDB-OBJ-E2E');
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await createPosition(request, portfolio.id, assetId, {
    invested_amount: currentValue,
    current_value: currentValue,
    quantity: 0,
    average_price: 0
  });
  await setActivePortfolio(request, portfolio.id);
  return { portfolioId: portfolio.id, assetId };
}

export async function patchAllocationPurposeViaApi(
  request: APIRequestContext,
  portfolioId: number,
  objectiveId: number,
  allocationId: number,
  payload: { exclude_from_rebalance?: boolean; is_emergency_reserve?: boolean }
): Promise<void> {
  const response = await request.patch(
    `${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/objectives/${objectiveId}/allocations/${allocationId}/purpose`,
    { data: payload }
  );
  expect(response.ok()).toBeTruthy();
}

export async function getAllocationIdBySliceName(
  request: APIRequestContext,
  portfolioId: number,
  objectiveId: number,
  sliceName: string
): Promise<number> {
  const snapshot = await getObjectivesSnapshot(request, portfolioId);
  const objective = snapshot.objectives.find((o: { id: number }) => o.id === objectiveId);
  expect(objective).toBeTruthy();
  const row = objective.allocations.find(
    (a: { slice_name: string }) => a.slice_name === sliceName
  );
  expect(row).toBeTruthy();
  return row.id as number;
}

export async function createObjectiveViaApi(
  request: APIRequestContext,
  portfolioId: number,
  name: string,
  options?: {
    mode?: 'multi_asset' | 'single_asset' | 'pension_contribution';
    partition_asset_id?: number;
    plan_year?: number;
    annual_gross_income_brl?: number;
    exclude_from_rebalance?: boolean;
    is_emergency_reserve?: boolean;
  }
): Promise<number> {
  const response = await request.post(`${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/objectives`, {
    data: { name, ...options }
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()).id as number;
}

export async function replaceAllocationViaApi(
  request: APIRequestContext,
  portfolioId: number,
  objectiveId: number,
  allocations: { slice_name: string; asset_id: number; quantity?: number; amount?: number }[]
): Promise<void> {
  const response = await request.put(
    `${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/objectives/${objectiveId}/allocations`,
    { data: { allocations } }
  );
  expect(response.ok()).toBeTruthy();
}

export async function getObjectivesSnapshot(request: APIRequestContext, portfolioId: number) {
  const response = await request.get(`${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/objectives`);
  expect(response.ok()).toBeTruthy();
  return response.json();
}

/** Cotas/valor livres no objetivo default (não exposto na UI). */
export async function expectDefaultObjectiveFreeQuantity(
  request: APIRequestContext,
  portfolioId: number,
  symbol: string,
  expectedQuantity: number
): Promise<void> {
  const snapshot = await getObjectivesSnapshot(request, portfolioId);
  const livre = snapshot.objectives.find((o: { is_default: boolean }) => o.is_default);
  expect(livre).toBeTruthy();
  const row = livre.allocations.find(
    (a: { symbol: string; quantity: number | null }) =>
      a.symbol === symbol || a.symbol.startsWith(symbol)
  );
  expect(row).toBeTruthy();
  expect(row.quantity).toBeCloseTo(expectedQuantity, 5);
}

export async function expectDefaultObjectiveHasNoAllocations(
  request: APIRequestContext,
  portfolioId: number
): Promise<void> {
  const snapshot = await getObjectivesSnapshot(request, portfolioId);
  const livre = snapshot.objectives.find((o: { is_default: boolean }) => o.is_default);
  expect(livre).toBeTruthy();
  expect(livre.allocations).toHaveLength(0);
}
