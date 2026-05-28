import { expect, type APIRequestContext } from '@playwright/test';

import { API_BASE_URL } from './apiResponses';
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

async function resetAnalysisConfig(request: APIRequestContext): Promise<void> {
  const response = await request.post(`${API_BASE_URL}/analysis/profiles/stock-br/config/reset`);
  expect(response.ok()).toBeTruthy();
}

async function resetFiiAnalysisConfig(request: APIRequestContext): Promise<void> {
  const response = await request.post(`${API_BASE_URL}/analysis/profiles/fii-br/config/reset`);
  expect(response.ok()).toBeTruthy();
}

export async function seedAnalysisEmpty(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, API_BASE_URL);
  await clearAllPortfolios(request);
  await resetAnalysisConfig(request);
  await resetFiiAnalysisConfig(request);
}

export async function seedAnalysisWithBbse3(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, API_BASE_URL);
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
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  await createPosition(request, portfolio.id, bbse3Id, { quantity: 100, average_price: 32.5 });
  await setActivePortfolio(request, portfolio.id);
}

export async function seedAnalysisWithFii(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, API_BASE_URL);
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
  const fiiId = await getAssetIdBySymbol(request, TICKER_HGLG11);
  await createPosition(request, portfolio.id, fiiId, { quantity: 10, average_price: 160 });
  await setActivePortfolio(request, portfolio.id);
}

export async function seedAnalysisWithTwoFiis(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, API_BASE_URL);
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
  const hglgId = await getAssetIdBySymbol(request, TICKER_HGLG11);
  const btlgId = await getAssetIdBySymbol(request, TICKER_BTLG11);
  await createPosition(request, portfolio.id, hglgId, { quantity: 10, average_price: 160 });
  await createPosition(request, portfolio.id, btlgId, { quantity: 5, average_price: 120 });
  await setActivePortfolio(request, portfolio.id);
}
