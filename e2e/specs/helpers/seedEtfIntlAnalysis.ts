import { expect, type APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import { E2E_PORTFOLIO_PRINCIPAL } from './e2eFixtures';
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

export async function seedEtfIntlAnalysis(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);

  await createAssetViaApi(request, {
    symbol: 'VOO',
    name: 'Vanguard S&P 500',
    asset_type: 'etf',
    market: 'international',
    country: 'US',
    currency: 'USD',
    current_quote: 400
  });

  const vooId = await getAssetId(request, 'VOO');
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await createPosition(request, portfolio.id, vooId, { quantity: 10, average_price: 380 });
  await setActivePortfolio(request, portfolio.id);
  await request.post(`${getWorkerApiBaseUrl()}/fx/usd-brl/refresh`);
  return portfolio.id;
}

export async function saveEtfIntlAllocationViaApi(
  request: APIRequestContext,
  portfolioId: number,
  assetId: number,
  targetPercent = 100,
  analysisLink = 'https://example.com/voo'
): Promise<void> {
  const response = await request.put(`${getWorkerApiBaseUrl()}/analysis/profiles/etf-intl/allocations`, {
    data: {
      portfolio_id: portfolioId,
      allocations: [{ asset_id: assetId, target_percent: targetPercent, analysis_link: analysisLink }]
    }
  });
  expect(response.ok()).toBeTruthy();
}
