import type { APIRequestContext } from '@playwright/test';

import { API_BASE_URL } from './apiResponses';
import {
  E2E_PORTFOLIO_PRINCIPAL,
  TICKER_BBSE3,
  TICKER_ITSA4,
  TICKER_KLBN
} from './e2eFixtures';
import { clearAllTestAssets, createAssetViaApi, seedAssetFromLookup } from './seedAssets';
import { createDividendPaymentViaApi } from './testDividendPayments';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from './testPortfolios';

export async function seedDadosPortfolioExportWithDividend(
  request: APIRequestContext
): Promise<number> {
  await clearAllTestAssets(request, API_BASE_URL);
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BBSE3);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const assetId = await getAssetIdBySymbol(request, TICKER_BBSE3);
  await createPosition(request, portfolio.id, assetId, { quantity: 100, average_price: 32.5 });
  await createDividendPaymentViaApi(request, {
    asset_id: assetId,
    portfolio_id: portfolio.id,
    payment_type: 'dividend',
    payment_date: '2024-06-15',
    amount: 150.75,
    currency: 'BRL'
  });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedDadosTwoCatalogAssets(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, API_BASE_URL);
  await clearAllPortfolios(request);
  await createAssetViaApi(request, {
    symbol: TICKER_BBSE3,
    name: 'BB Seguridade Participações S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  await createAssetViaApi(request, {
    symbol: TICKER_ITSA4,
    name: 'Itaúsa S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
}

export async function seedDadosKlbnPositionWithDividend(
  request: APIRequestContext
): Promise<number> {
  await clearAllTestAssets(request, API_BASE_URL);
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_KLBN);
  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const assetId = await getAssetIdBySymbol(request, TICKER_KLBN);
  await createPosition(request, portfolio.id, assetId, { quantity: 50, average_price: 18 });
  await createDividendPaymentViaApi(request, {
    asset_id: assetId,
    portfolio_id: portfolio.id,
    payment_type: 'dividend',
    payment_date: '2024-03-20',
    amount: 25,
    currency: 'BRL'
  });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}
