import type { APIRequestContext } from '@playwright/test';

import { TICKER_BBSE3, TICKER_VOO } from './e2eFixtures';
import { clearAllTestAssets, createAssetViaApi } from './seedAssets';
import { getWorkerApiBaseUrl } from './workerContext';
import { clearAllDividendPayments, createDividendPaymentViaApi } from './testDividendPayments';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  createYearSnapshotViaApi,
  getAssetIdBySymbol,
  setActivePortfolio
} from './testPortfolios';

const DEFAULT_PORTFOLIO_NAME = 'Carteira IR';

export async function seedConferenciaIrBase(request: APIRequestContext): Promise<number> {
  await clearAllDividendPayments(request);
  await clearAllPortfolios(request);
  await clearAllTestAssets(request, getWorkerApiBaseUrl());

  await createAssetViaApi(request, {
    symbol: TICKER_BBSE3,
    name: 'BB Seguridade Participações S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });

  const portfolio = await createPortfolio(request, DEFAULT_PORTFOLIO_NAME);
  await setActivePortfolio(request, portfolio.id);
  const assetId = await getAssetIdBySymbol(request, TICKER_BBSE3);

  await createDividendPaymentViaApi(request, {
    asset_id: assetId,
    portfolio_id: portfolio.id,
    payment_type: 'dividend',
    payment_date: '2024-03-10',
    amount: 100,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: assetId,
    portfolio_id: portfolio.id,
    payment_type: 'jcp',
    payment_date: '2024-09-01',
    amount: 30,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: assetId,
    portfolio_id: portfolio.id,
    payment_type: 'dividend',
    payment_date: '2023-06-01',
    amount: 999,
    currency: 'BRL'
  });

  await createPosition(request, portfolio.id, assetId, { quantity: 100, average_price: 32.5 });

  return portfolio.id;
}

/** Nacional + internacional no mesmo ano, com snapshot de posições. */
export async function seedConferenciaIrWithInternational(
  request: APIRequestContext
): Promise<number> {
  const portfolioId = await seedConferenciaIrBase(request);

  await createAssetViaApi(request, {
    symbol: TICKER_VOO,
    name: 'Vanguard S&P 500 ETF',
    asset_type: 'etf',
    market: 'international',
    country: 'US',
    currency: 'USD'
  });

  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);
  await createDividendPaymentViaApi(request, {
    asset_id: vooId,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2024-04-15',
    amount: 25,
    currency: 'USD'
  });
  await createPosition(request, portfolioId, vooId, { quantity: 5, average_price: 400 });
  await createYearSnapshotViaApi(request, portfolioId, 2024, true);

  return portfolioId;
}
