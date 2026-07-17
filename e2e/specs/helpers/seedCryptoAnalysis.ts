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
  portfolioId: number,
  allocations: { asset_id: number; target_percent: number; analysis_link?: string | null }[]
): Promise<void> {
  const response = await request.put(`${getWorkerApiBaseUrl()}/analysis/profiles/crypto/allocations`, {
    data: { portfolio_id: portfolioId, allocations }
  });
  expect(
    response.ok(),
    `crypto allocations failed (${response.status()}): ${await response.text()}`
  ).toBeTruthy();
}

export async function seedCryptoRebalanceNoQuote(request: APIRequestContext): Promise<number> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
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
      current_quote: null
    });

    const assets = await request.get(`${getWorkerApiBaseUrl()}/assets`);
    expect(assets.ok()).toBeTruthy();
    const list = (await assets.json()) as { id: number; symbol: string }[];
    const btc = list.find((a) => a.symbol === TICKER_BTC_USD);
    const abtc = list.find((a) => a.symbol === TICKER_ABTC11);
    if (!btc || !abtc) {
      if (attempt === 2) {
        throw new Error('crypto assets not found');
      }
      continue;
    }

    const portfolio = await createPortfolio(request, 'Crypto sem cotacao');
    await createPosition(request, portfolio.id, btc.id, { quantity: 0.1, average_price: 60000 });
    await createPosition(request, portfolio.id, abtc.id, { quantity: 1, average_price: 1 });
    await setActivePortfolio(request, portfolio.id);
    await request.post(`${getWorkerApiBaseUrl()}/fx/usd-brl/refresh`);

    const allocationResponse = await request.put(
      `${getWorkerApiBaseUrl()}/analysis/profiles/crypto/allocations`,
      {
        data: {
          portfolio_id: portfolio.id,
          allocations: [
            { asset_id: btc.id, target_percent: 40 },
            { asset_id: abtc.id, target_percent: 60 }
          ]
        }
      }
    );
    if (allocationResponse.ok()) {
      return portfolio.id;
    }
    if (attempt === 2) {
      expect(
        allocationResponse.ok(),
        `crypto allocations failed (${allocationResponse.status()}): ${await allocationResponse.text()}`
      ).toBeTruthy();
    }
  }

  throw new Error('seedCryptoRebalanceNoQuote exhausted retries');
}
