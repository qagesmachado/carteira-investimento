import type { APIRequestContext } from '@playwright/test';
import { expect } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import { E2E_PORTFOLIO_PRINCIPAL, TICKER_BBSE3, TICKER_VOO, TICKER_AUVP11 } from './e2eFixtures';
import { seedConsolidadaPrincipal } from './seedConsolidada';
import { clearAllTestAssets, createAssetViaApi } from './seedAssets';
import { createDividendPaymentViaApi } from './testDividendPayments';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from './testPortfolios';

async function setAssetCurrentQuote(
  request: APIRequestContext,
  symbol: string,
  currentQuote: number
): Promise<void> {
  const assetId = await getAssetIdBySymbol(request, symbol);
  const response = await request.patch(`${getWorkerApiBaseUrl()}/assets/${assetId}`, {
    data: { current_quote: currentQuote }
  });
  expect(response.ok()).toBeTruthy();
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/**
 * Carteira ativa mínima sem lookup yfinance — suficiente para atalhos do dashboard.
 */
export async function seedDashboardActivePortfolioOnly(
  request: APIRequestContext
): Promise<number> {
  await clearAllPortfolios(request);
  await clearAllTestAssets(request, getWorkerApiBaseUrl());

  await createAssetViaApi(request, {
    symbol: TICKER_BBSE3,
    name: 'BB Seguridade',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    current_quote: 40
  });

  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  await createPosition(request, portfolio.id, bbse3Id, { quantity: 10, average_price: 32 });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

/** Carteira com proventos em varios anos e meses (painel do dashboard). */
export async function seedDashboardDividendSummary(
  request: APIRequestContext
): Promise<number> {
  const portfolioId = await seedConsolidadaPrincipal(request);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);

  await setAssetCurrentQuote(request, TICKER_BBSE3, 40);
  await setAssetCurrentQuote(request, TICKER_VOO, 500);
  await setAssetCurrentQuote(request, TICKER_AUVP11, 120);

  const now = new Date();
  const year = now.getFullYear();
  const month = pad2(now.getMonth() + 1);

  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2020-06-15',
    amount: 80,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2021-02-10',
    amount: 120,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: vooId,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2021-08-20',
    amount: 4,
    currency: 'USD'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: `${year}-03-15`,
    amount: 100,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: vooId,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: `${year}-${month}-10`,
    amount: 5,
    currency: 'USD'
  });

  return portfolioId;
}

const DEFAULT_ALLOCATION_TARGETS = JSON.stringify({
  classes: {
    stocks: 25,
    funds: 10,
    international: 15,
    fixed_income: 45,
    crypto: 5
  },
  stocks_split: { etf: 60, stock: 40 }
});

/** Define metas de rebalanceamento na carteira ativa (seed consolidada). */
export async function seedDashboardRebalanceTargets(
  request: APIRequestContext,
  portfolioId: number
): Promise<void> {
  const response = await request.patch(`${getWorkerApiBaseUrl()}/portfolios/${portfolioId}`, {
    data: { allocation_targets_json: DEFAULT_ALLOCATION_TARGETS }
  });
  expect(response.ok()).toBeTruthy();
}
