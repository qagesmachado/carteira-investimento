import type { APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import {
  E2E_CDB_IDENTIFIER,
  E2E_CDB_NAME,
  E2E_PORTFOLIO_PRINCIPAL,
  E2E_PORTFOLIO_SECONDARY,
  TICKER_AUVP11,
  TICKER_BBSE3,
  TICKER_VOO
} from './e2eFixtures';
import {
  clearAllTestAssets,
  createAssetViaApi,
  seedAssetFromLookup
} from './seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from './testPortfolios';

export async function seedConsolidadaEmpty(request: APIRequestContext): Promise<void> {
  await clearAllPortfolios(request);
}

export async function seedManualFixedIncomeAsset(request: APIRequestContext): Promise<void> {
  await createAssetViaApi(request, {
    symbol: E2E_CDB_IDENTIFIER,
    name: E2E_CDB_NAME,
    asset_type: 'fixed_income',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    fixed_income_indexer: 'ipca_plus',
    fixed_income_yield_description: 'IPCA + 8,4% a.a.',
    fixed_income_title_type: 'cdb',
    maturity_date: '2028-12-31',
    purchase_date: '2024-01-15'
  });
}

export async function seedConsolidadaPrincipal(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);

  await seedAssetFromLookup(request, TICKER_BBSE3);
  await seedAssetFromLookup(request, TICKER_VOO);
  await seedAssetFromLookup(request, TICKER_AUVP11, { etf_subtype: 'fixed_income' });
  await seedManualFixedIncomeAsset(request);

  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);

  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);
  const auvpId = await getAssetIdBySymbol(request, TICKER_AUVP11);
  const rfId = await getAssetIdBySymbol(request, E2E_CDB_IDENTIFIER);

  await createPosition(request, portfolio.id, bbse3Id, { quantity: 100, average_price: 32 });
  await createPosition(request, portfolio.id, vooId, { quantity: 5, average_price: 400 });
  await createPosition(request, portfolio.id, auvpId, { quantity: 50, average_price: 110 });
  await createPosition(request, portfolio.id, rfId, {
    quantity: 1,
    average_price: 1000
  });

  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedConsolidadaTwoPortfolios(request: APIRequestContext): Promise<{
  principalId: number;
  secondaryId: number;
}> {
  const principalId = await seedConsolidadaPrincipal(request);
  const secondary = await createPortfolio(request, E2E_PORTFOLIO_SECONDARY);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  await createPosition(request, secondary.id, bbse3Id, { quantity: 1, average_price: 30 });
  return { principalId, secondaryId: secondary.id };
}

export async function seedConsolidadaForRfFilter(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);

  await seedAssetFromLookup(request, TICKER_BBSE3);
  await seedAssetFromLookup(request, TICKER_AUVP11, { etf_subtype: 'fixed_income' });
  await seedManualFixedIncomeAsset(request);

  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const auvpId = await getAssetIdBySymbol(request, TICKER_AUVP11);
  const rfId = await getAssetIdBySymbol(request, E2E_CDB_IDENTIFIER);

  await createPosition(request, portfolio.id, bbse3Id, { quantity: 10, average_price: 32 });
  await createPosition(request, portfolio.id, auvpId, { quantity: 20, average_price: 100 });
  await createPosition(request, portfolio.id, rfId, { quantity: 1, average_price: 1000 });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}
