import { expect, type APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import {
  E2E_PORTFOLIO_PRINCIPAL,
  TICKER_BBSE3,
  TICKER_BTLG11,
  TICKER_HGLG11
} from './e2eFixtures';
import { clearAllTestAssets, createAssetViaApi } from './seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from './testPortfolios';

export type AnalysisProfileSlug = 'stock-br' | 'fii-br' | 'etf-intl' | 'crypto';
export type AnalysisMethodology = 'simples' | 'auvp';

export async function setPortfolioMethodology(
  request: APIRequestContext,
  portfolioId: number,
  profile: AnalysisProfileSlug,
  methodology: AnalysisMethodology
): Promise<void> {
  const response = await request.put(
    `${getWorkerApiBaseUrl()}/analysis/profiles/${profile}/methodology`,
    { data: { portfolio_id: portfolioId, methodology } }
  );
  expect(response.ok()).toBeTruthy();
}

export async function setPortfolioMethodologyAuvp(
  request: APIRequestContext,
  portfolioId: number,
  ...profiles: AnalysisProfileSlug[]
): Promise<void> {
  const targets = profiles.length > 0 ? profiles : (['stock-br', 'fii-br'] as AnalysisProfileSlug[]);
  for (const profile of targets) {
    await setPortfolioMethodology(request, portfolioId, profile, 'auvp');
  }
}

export async function expectPortfolioMethodology(
  request: APIRequestContext,
  portfolioId: number,
  profile: AnalysisProfileSlug,
  methodology: AnalysisMethodology
): Promise<void> {
  const response = await request.get(
    `${getWorkerApiBaseUrl()}/analysis/profiles/${profile}/methodology?portfolio_id=${portfolioId}`
  );
  expect(response.ok()).toBeTruthy();
  expect((await response.json()).methodology).toBe(methodology);
}

async function resetAnalysisConfig(request: APIRequestContext): Promise<void> {
  const response = await request.post(`${getWorkerApiBaseUrl()}/analysis/profiles/stock-br/config/reset`);
  expect(response.ok()).toBeTruthy();
}

async function resetFiiAnalysisConfig(request: APIRequestContext): Promise<void> {
  const response = await request.post(`${getWorkerApiBaseUrl()}/analysis/profiles/fii-br/config/reset`);
  expect(response.ok()).toBeTruthy();
}

export async function seedAnalysisEmpty(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await resetAnalysisConfig(request);
  await resetFiiAnalysisConfig(request);
}

export async function seedAnalysisWithBbse3(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await resetAnalysisConfig(request);
  await createAssetViaApi(request, {
    symbol: TICKER_BBSE3,
    name: 'BB Seguridade Participações S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setPortfolioMethodologyAuvp(request, portfolio.id, 'stock-br');
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  await createPosition(request, portfolio.id, bbse3Id, { quantity: 100, average_price: 32.5 });
  await setActivePortfolio(request, portfolio.id);
}

export async function seedAnalysisWithPendingBbse3(request: APIRequestContext): Promise<void> {
  await seedAnalysisWithBbse3(request);
  const portfolioResponse = await request.get(`${getWorkerApiBaseUrl()}/portfolios`);
  expect(portfolioResponse.ok()).toBeTruthy();
  const portfolios = (await portfolioResponse.json()) as { id: number; name: string }[];
  const portfolio = portfolios.find((item) => item.name === E2E_PORTFOLIO_PRINCIPAL);
  expect(portfolio).toBeTruthy();
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const pendingResponse = await request.put(
    `${getWorkerApiBaseUrl()}/analysis/assets/${bbse3Id}/pending?profile=stock_br`,
    { data: { portfolio_id: portfolio!.id, is_pending: true } }
  );
  expect(pendingResponse.ok()).toBeTruthy();
}

export async function seedAnalysisWithFii(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await resetAnalysisConfig(request);
  await resetFiiAnalysisConfig(request);
  await createAssetViaApi(request, {
    symbol: TICKER_HGLG11,
    name: 'CSHG Logística FII',
    asset_type: 'fii',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setPortfolioMethodologyAuvp(request, portfolio.id, 'fii-br');
  const fiiId = await getAssetIdBySymbol(request, TICKER_HGLG11);
  await createPosition(request, portfolio.id, fiiId, { quantity: 10, average_price: 160 });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedAnalysisWithTwoFiis(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await resetAnalysisConfig(request);
  await resetFiiAnalysisConfig(request);
  await createAssetViaApi(request, {
    symbol: TICKER_HGLG11,
    name: 'CSHG Logística FII',
    asset_type: 'fii',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  await createAssetViaApi(request, {
    symbol: TICKER_BTLG11,
    name: 'BTG Pactual Logística FII',
    asset_type: 'fii',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setPortfolioMethodologyAuvp(request, portfolio.id, 'fii-br');
  const hglgId = await getAssetIdBySymbol(request, TICKER_HGLG11);
  const btlgId = await getAssetIdBySymbol(request, TICKER_BTLG11);
  await createPosition(request, portfolio.id, hglgId, { quantity: 10, average_price: 160 });
  await createPosition(request, portfolio.id, btlgId, { quantity: 5, average_price: 120 });
  await setActivePortfolio(request, portfolio.id);
}
