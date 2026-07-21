import { expect, type APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import { E2E_PORTFOLIO_PRINCIPAL } from './e2eFixtures';
import { clearAllTestAssets, createAssetViaApi } from './seedAssets';
import { setPortfolioMethodologyAuvp, expectPortfolioMethodology } from './seedAnalysis';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  setActivePortfolio
} from './testPortfolios';

const VIABILIDADE = 'viabilidade';

async function resetAnalysisConfig(request: APIRequestContext): Promise<void> {
  const response = await request.post(`${getWorkerApiBaseUrl()}/analysis/profiles/stock-br/config/reset`);
  expect(response.ok()).toBeTruthy();
}

async function resetFiiAnalysisConfig(request: APIRequestContext): Promise<void> {
  const response = await request.post(`${getWorkerApiBaseUrl()}/analysis/profiles/fii-br/config/reset`);
  expect(response.ok()).toBeTruthy();
}

async function setAssetScores(
  request: APIRequestContext,
  assetId: number,
  overrides: Record<string, number> = {}
): Promise<void> {
  const scores = {
    lucros: 5,
    divida: 5,
    tag_along: 5,
    segmento: 5,
    [VIABILIDADE]: 2,
    roe: 1,
    cagr: 1,
    ...overrides
  };
  const response = await request.put(`${getWorkerApiBaseUrl()}/analysis/assets/${assetId}/scores`, {
    data: { scores }
  });
  expect(response.ok()).toBeTruthy();
}

async function setFiiScores(
  request: APIRequestContext,
  assetId: number,
  overrides: Record<string, number> = {}
): Promise<void> {
  const scores = {
    vacancia: 5,
    qtd_ativos: 5,
    alavancagem: 5,
    segmento_fii: 5,
    [VIABILIDADE]: 2,
    localizacao: 1,
    pvp: -1,
    ...overrides
  };
  const response = await request.put(
    `${getWorkerApiBaseUrl()}/analysis/assets/${assetId}/scores?profile=fii_br`,
    { data: { scores } }
  );
  expect(response.ok()).toBeTruthy();
}

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

export async function seedRebalanceEmpty(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await resetAnalysisConfig(request);
  await resetFiiAnalysisConfig(request);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedRebalanceWithMix(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await resetAnalysisConfig(request);
  await resetFiiAnalysisConfig(request);

  await createAssetViaApi(request, {
    symbol: 'AAA3',
    name: 'Empresa A',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    current_quote: 100
  });
  await createAssetViaApi(request, {
    symbol: 'BBB3',
    name: 'Empresa B',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    current_quote: 50
  });
  await createAssetViaApi(request, {
    symbol: 'BOVA11',
    name: 'ETF BOVA',
    asset_type: 'etf',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    etf_subtype: 'variable_income',
    current_quote: 100
  });
  await createAssetViaApi(request, {
    symbol: 'CDB-E2E-RF',
    name: 'CDB Teste',
    asset_type: 'fixed_income',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });

  const aaaId = await getAssetId(request, 'AAA3');
  const bbbId = await getAssetId(request, 'BBB3');
  const etfId = await getAssetId(request, 'BOVA11');
  await setAssetScores(request, aaaId);
  await setAssetScores(request, bbbId, { lucros: 3 });
  await setAssetScores(request, etfId, { roe: 2, cagr: 2 });

  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await createPosition(request, portfolio.id, aaaId, { quantity: 100, average_price: 80 });
  await createPosition(request, portfolio.id, bbbId, { quantity: 100, average_price: 40 });
  await createPosition(request, portfolio.id, etfId, { quantity: 50, average_price: 90 });
  const rfId = await getAssetId(request, 'CDB-E2E-RF');
  await createPosition(request, portfolio.id, rfId, {
    invested_amount: 40_000,
    current_value: 40_000
  });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedRebalanceTwoStocksScored(
  request: APIRequestContext
): Promise<{ portfolioId: number; aaaId: number; bbbId: number }> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await resetAnalysisConfig(request);
  await resetFiiAnalysisConfig(request);

  await createAssetViaApi(request, {
    symbol: 'AAA3',
    name: 'Empresa A',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    current_quote: 100
  });
  await createAssetViaApi(request, {
    symbol: 'BBB3',
    name: 'Empresa B',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    current_quote: 100
  });

  const aaaId = await getAssetId(request, 'AAA3');
  const bbbId = await getAssetId(request, 'BBB3');
  await setAssetScores(request, aaaId, { roe: 2, cagr: 2 });
  await setAssetScores(request, bbbId, { roe: 1, cagr: 0 });

  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setPortfolioMethodologyAuvp(request, portfolio.id, 'stock-br');
  await expectPortfolioMethodology(request, portfolio.id, 'stock-br', 'auvp');
  await createPosition(request, portfolio.id, aaaId, { quantity: 10, average_price: 80 });
  await createPosition(request, portfolio.id, bbbId, { quantity: 10, average_price: 80 });
  await setActivePortfolio(request, portfolio.id);
  return { portfolioId: portfolio.id, aaaId, bbbId };
}

export async function seedRebalanceTwoFiisScored(
  request: APIRequestContext
): Promise<{ portfolioId: number; hglgId: number; xplgId: number }> {
  await clearAllPortfolios(request);
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await resetAnalysisConfig(request);
  await resetFiiAnalysisConfig(request);

  await createAssetViaApi(request, {
    symbol: 'HGLG11',
    name: 'CSHG Logística FII',
    asset_type: 'fii',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    current_quote: 150
  });
  await createAssetViaApi(request, {
    symbol: 'XPLG11',
    name: 'XP Log FII',
    asset_type: 'fii',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    current_quote: 100
  });

  const hglgId = await getAssetId(request, 'HGLG11');
  const xplgId = await getAssetId(request, 'XPLG11');
  await setFiiScores(request, hglgId);
  await setFiiScores(request, xplgId, { vacancia: 3 });

  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  await setPortfolioMethodologyAuvp(request, portfolio.id, 'fii-br');
  await expectPortfolioMethodology(request, portfolio.id, 'fii-br', 'auvp');
  await createPosition(request, portfolio.id, hglgId, { quantity: 20, average_price: 140 });
  await createPosition(request, portfolio.id, xplgId, { quantity: 10, average_price: 90 });
  await setActivePortfolio(request, portfolio.id);

  const rebalanceCheck = await request.get(
    `${getWorkerApiBaseUrl()}/portfolios/${portfolio.id}/rebalance`
  );
  expect(rebalanceCheck.ok()).toBeTruthy();
  const rebalanceBody = (await rebalanceCheck.json()) as {
    fund_assets: { symbol: string; sum_score: number | null; target_percent: number | null }[];
  };
  const hglg = rebalanceBody.fund_assets.find((a) => a.symbol === 'HGLG11');
  const xplg = rebalanceBody.fund_assets.find((a) => a.symbol === 'XPLG11');
  expect(hglg?.sum_score ?? 0).toBeGreaterThan(0);
  expect(xplg?.sum_score ?? 0).toBeGreaterThan(0);
  expect(hglg?.target_percent ?? null).not.toBeNull();
  expect(xplg?.target_percent ?? null).not.toBeNull();

  return { portfolioId: portfolio.id, hglgId, xplgId };
}
