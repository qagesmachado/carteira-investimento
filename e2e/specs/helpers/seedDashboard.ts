import type { APIRequestContext } from '@playwright/test';

import { TICKER_BBSE3, TICKER_VOO } from './e2eFixtures';
import { seedConsolidadaPrincipal } from './seedConsolidada';
import { createDividendPaymentViaApi } from './testDividendPayments';
import { getAssetIdBySymbol } from './testPortfolios';

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

/** Carteira com proventos em varios anos e meses (painel do dashboard). */
export async function seedDashboardDividendSummary(
  request: APIRequestContext
): Promise<number> {
  const portfolioId = await seedConsolidadaPrincipal(request);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);

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
