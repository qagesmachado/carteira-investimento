import { expect, type APIRequestContext } from '@playwright/test';

import { API_BASE_URL } from './apiResponses';

export async function clearAllPortfolios(request: APIRequestContext): Promise<void> {
  const listResponse = await request.get(`${API_BASE_URL}/portfolios`);
  expect(listResponse.ok()).toBeTruthy();
  const portfolios = (await listResponse.json()) as { id: number }[];

  for (const portfolio of portfolios) {
    const deleteResponse = await request.delete(
      `${API_BASE_URL}/portfolios/${portfolio.id}?cascade=all`
    );
    expect(deleteResponse.ok()).toBeTruthy();
  }
}

export async function createPortfolio(
  request: APIRequestContext,
  name: string
): Promise<{ id: number; name: string }> {
  const response = await request.post(`${API_BASE_URL}/portfolios`, {
    data: { name, base_currency: 'BRL' }
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { id: number; name: string };
}

export async function setActivePortfolio(
  request: APIRequestContext,
  portfolioId: number
): Promise<void> {
  const response = await request.put(`${API_BASE_URL}/portfolios/active`, {
    data: { portfolio_id: portfolioId }
  });
  expect(response.ok()).toBeTruthy();
}

export type PositionSeedOptions = {
  quantity?: number;
  average_price?: number;
  invested_amount?: number;
  current_value?: number;
  contracted_yield?: string;
};

export async function createPosition(
  request: APIRequestContext,
  portfolioId: number,
  assetId: number,
  options: PositionSeedOptions = {}
): Promise<void> {
  const data: Record<string, unknown> = { asset_id: assetId };
  if (options.invested_amount != null) {
    data.invested_amount = options.invested_amount;
    data.current_value = options.current_value ?? options.invested_amount;
    data.contracted_yield = options.contracted_yield ?? 'IPCA + 8,4% a.a.';
    data.quantity = options.quantity ?? 0;
    data.average_price = options.average_price ?? 0;
  } else {
    data.quantity = options.quantity ?? 10;
    data.average_price = options.average_price ?? 25;
  }
  const response = await request.post(`${API_BASE_URL}/portfolios/${portfolioId}/positions`, {
    data
  });
  expect(response.ok()).toBeTruthy();
}

export async function getAssetIdBySymbol(
  request: APIRequestContext,
  symbol: string
): Promise<number> {
  const listResponse = await request.get(`${API_BASE_URL}/assets`);
  expect(listResponse.ok()).toBeTruthy();
  const assets = (await listResponse.json()) as { id: number; symbol: string }[];
  const target = symbol.trim().toUpperCase().replace(/\.SA$/, '');
  const asset = assets.find(
    (a) => a.symbol.trim().toUpperCase().replace(/\.SA$/, '') === target
  );
  if (!asset) {
    throw new Error(`Ativo não encontrado: ${symbol}`);
  }
  return asset.id;
}
