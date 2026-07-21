import { expect, type APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';

export async function clearAllPortfolios(request: APIRequestContext): Promise<void> {
  const listResponse = await request.get(`${getWorkerApiBaseUrl()}/portfolios`);
  expect(listResponse.ok()).toBeTruthy();
  const portfolios = (await listResponse.json()) as { id: number }[];

  for (const portfolio of portfolios) {
    await request.patch(`${getWorkerApiBaseUrl()}/portfolios/${portfolio.id}`, {
      data: { delete_locked: false }
    });
    const deleteResponse = await request.delete(
      `${getWorkerApiBaseUrl()}/portfolios/${portfolio.id}?cascade=all`
    );
    expect(deleteResponse.ok()).toBeTruthy();
  }
}

export async function createPortfolio(
  request: APIRequestContext,
  name: string
): Promise<{ id: number; name: string }> {
  const response = await request.post(`${getWorkerApiBaseUrl()}/portfolios`, {
    data: { name, base_currency: 'BRL' }
  });
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { id: number; name: string };
}

export async function setActivePortfolio(
  request: APIRequestContext,
  portfolioId: number
): Promise<void> {
  const response = await request.put(`${getWorkerApiBaseUrl()}/portfolios/active`, {
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
  const response = await request.post(`${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/positions`, {
    data
  });
  expect(response.ok()).toBeTruthy();
}

export async function getAssetIdBySymbol(
  request: APIRequestContext,
  symbol: string
): Promise<number> {
  const listResponse = await request.get(`${getWorkerApiBaseUrl()}/assets`);
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

export async function createYearSnapshotViaApi(
  request: APIRequestContext,
  portfolioId: number,
  year: number,
  replace = false
): Promise<void> {
  const response = await request.post(
    `${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/year-snapshots`,
    { data: { year, replace } }
  );
  expect(response.ok()).toBeTruthy();
}
