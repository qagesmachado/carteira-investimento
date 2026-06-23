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

export async function seedPatrimonyControlEmpty(
  request: APIRequestContext
): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedPatrimonyControlWithStock(
  request: APIRequestContext,
  symbol = `PAT${Date.now()}${Math.floor(Math.random() * 1000)}`,
  quantity = 100,
  quote = 10
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
    current_quote: quote
  });

  const assetId = await getAssetIdBySymbol(request, symbol);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await createPosition(request, portfolio.id, assetId, { quantity, average_price: 8 });
  await setActivePortfolio(request, portfolio.id);
  return { portfolioId: portfolio.id, assetId };
}

export async function createManualPatrimonyItemViaApi(
  request: APIRequestContext,
  portfolioId: number,
  payload: {
    category: 'emergency_reserve';
    name: string;
    amount_brl: number;
    location: string;
  }
): Promise<number> {
  const response = await request.post(
    `${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/manual-patrimony-items`,
    { data: payload }
  );
  expect(response.ok()).toBeTruthy();
  return (await response.json()).id as number;
}

export async function seedPatrimonyControlFullMix(
  request: APIRequestContext
): Promise<number> {
  const { portfolioId } = await seedPatrimonyControlWithStock(request);
  await createManualPatrimonyItemViaApi(request, portfolioId, {
    category: 'emergency_reserve',
    name: 'Conta Nubank',
    amount_brl: 5_000,
    location: 'banco'
  });
  await createManualPatrimonyItemViaApi(request, portfolioId, {
    category: 'emergency_reserve',
    name: 'Cofre casa',
    amount_brl: 500,
    location: 'dinheiro_especie'
  });
  return portfolioId;
}

export async function getPatrimonyControlSnapshot(
  request: APIRequestContext,
  portfolioId: number
) {
  const response = await request.get(
    `${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/patrimony-control`
  );
  expect(response.ok()).toBeTruthy();
  return response.json();
}
