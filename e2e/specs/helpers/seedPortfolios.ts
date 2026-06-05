import type { APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import {
  E2E_CDB_IDENTIFIER,
  E2E_CDB_NAME,
  E2E_PENSION_IDENTIFIER,
  E2E_PENSION_NAME,
  E2E_PORTFOLIO_AUX,
  E2E_PORTFOLIO_PRINCIPAL,
  E2E_PORTFOLIO_SECONDARY,
  TICKER_BBSE3,
  TICKER_VOO
} from './e2eFixtures';
import {
  clearAllTestAssets,
  createAssetViaApi,
  seedAssetFromLookup,
  seedManualFixedIncome
} from './seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from './testPortfolios';

export async function seedPortfoliosEmptyAssetsOnly(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BBSE3);
}

export async function seedPortfoliosPrincipalOnly(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BBSE3);
  await seedAssetFromLookup(request, TICKER_VOO);
}

export async function seedPortfoliosEmpty(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
}

export async function seedPortfoliosPrincipalWithBbse3(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BBSE3);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  await createPosition(request, portfolio.id, bbse3Id, { quantity: 100, average_price: 32.5 });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedPortfoliosPrincipalWithVoo(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_VOO);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);
  await createPosition(request, portfolio.id, vooId, { quantity: 5, average_price: 400 });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedPortfoliosTwoPortfolios(request: APIRequestContext): Promise<{
  principalId: number;
  secondaryId: number;
}> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BBSE3);
  const principal = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const secondary = await createPortfolio(request, E2E_PORTFOLIO_SECONDARY);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  await createPosition(request, principal.id, bbse3Id, { quantity: 10, average_price: 30 });
  await setActivePortfolio(request, principal.id);
  return { principalId: principal.id, secondaryId: secondary.id };
}

export async function seedPortfoliosAuxForRename(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BBSE3);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_AUX);
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedPortfoliosWithRfPosition(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedManualFixedIncome(request);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const rfId = await getAssetIdBySymbol(request, E2E_CDB_IDENTIFIER);
  await createPosition(request, portfolio.id, rfId, {
    invested_amount: 10000,
    current_value: 10500,
    contracted_yield: 'IPCA + 8,4% a.a.'
  });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedPortfoliosWithPension(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await createAssetViaApi(request, {
    symbol: E2E_PENSION_IDENTIFIER,
    name: E2E_PENSION_NAME,
    asset_type: 'pension',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedPortfoliosFullMix(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BBSE3);
  await seedAssetFromLookup(request, TICKER_VOO);
  await seedManualFixedIncome(request);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);
  const rfId = await getAssetIdBySymbol(request, E2E_CDB_IDENTIFIER);
  await createPosition(request, portfolio.id, bbse3Id, { quantity: 50, average_price: 32 });
  await createPosition(request, portfolio.id, vooId, { quantity: 3, average_price: 420 });
  await createPosition(request, portfolio.id, rfId, {
    invested_amount: 8000,
    current_value: 8200,
    contracted_yield: 'IPCA + 8,4% a.a.'
  });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

/** BBSE3 no DB via lookup; fixture JSON traz `name` diferente para gerar conflito na importação. */
export async function seedPortfoliosForImportConflict(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BBSE3);
}

export async function seedPortfoliosForImport(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BBSE3);
  await seedAssetFromLookup(request, TICKER_VOO);
}

export async function seedPortfoliosPrincipalWithFlry3Disposable(
  request: APIRequestContext
): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, 'FLRY3');
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const flryId = await getAssetIdBySymbol(request, 'FLRY3');
  await createPosition(request, portfolio.id, flryId, { quantity: 20, average_price: 15 });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}
