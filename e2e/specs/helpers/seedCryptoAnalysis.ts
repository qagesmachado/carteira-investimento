import { expect, type APIRequestContext } from '@playwright/test';

import { E2E_PORTFOLIO_PRINCIPAL, TICKER_ABTC11, TICKER_BTC_USD } from './e2eFixtures';
import { getWorkerApiBaseUrl } from './workerContext';
import { clearAllTestAssets, createAssetViaApi } from './seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  setActivePortfolio
} from './testPortfolios';

async function getAssetId(request: APIRequestContext, symbol: string): Promise<number> {
  const response = await request.get(`${getWorkerApiBaseUrl()}/assets`);
  expect(response.ok()).toBeTruthy();
  const assets = (await response.json()) as { id: number; symbol: string }[];
  const asset = assets.find((a) => a.symbol === symbol);
  if (!asset) {
    throw new Error(`Asset not found: ${symbol}`);
  }
  return asset.id;
}

export async function seedCryptoAnalysis(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);

  await createAssetViaApi(request, {
    symbol: TICKER_BTC_USD,
    name: 'Bitcoin USD',
    asset_type: 'crypto',
    market: 'international',
    country: 'US',
    currency: 'USD',
    current_quote: 65000
  });

  await createAssetViaApi(request, {
    symbol: TICKER_ABTC11,
    name: 'ETF Bitcoin',
    asset_type: 'etf',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    etf_subtype: 'crypto',
    current_quote: 50
  });

  const btcId = await getAssetId(request, TICKER_BTC_USD);
  const abtcId = await getAssetId(request, TICKER_ABTC11);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await createPosition(request, portfolio.id, btcId, { quantity: 0.1, average_price: 60000 });
  await createPosition(request, portfolio.id, abtcId, { quantity: 100, average_price: 45 });
  await setActivePortfolio(request, portfolio.id);
  await request.post(`${getWorkerApiBaseUrl()}/fx/usd-brl/refresh`);
  return portfolio.id;
}

export async function saveCryptoAllocationViaApi(
  request: APIRequestContext,
  allocations: { asset_id: number; target_percent: number; analysis_link?: string | null }[]
): Promise<void> {
  const response = await request.put(`${getWorkerApiBaseUrl()}/analysis/profiles/crypto/allocations`, {
    data: { allocations }
  });
  expect(response.ok()).toBeTruthy();
}
