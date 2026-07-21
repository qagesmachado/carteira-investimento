import type { APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import { TICKER_BBSE3, TICKER_ITSA4, TICKER_VOO } from './e2eFixtures';
import { clearAllTestAssets, createAssetViaApi } from './seedAssets';
import { clearAllDividendPayments, createDividendPaymentViaApi } from './testDividendPayments';
import { clearAllPortfolios, createPortfolio, getAssetIdBySymbol, setActivePortfolio } from './testPortfolios';

const DEFAULT_PORTFOLIO_NAME = 'Carteira Proventos';

async function resetProventosData(request: APIRequestContext): Promise<void> {
  await clearAllDividendPayments(request);
  await clearAllPortfolios(request);
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
}

async function ensureDefaultPortfolio(request: APIRequestContext): Promise<number> {
  const portfolio = await createPortfolio(request, DEFAULT_PORTFOLIO_NAME);
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}

export async function seedProventosEmpty(request: APIRequestContext): Promise<void> {
  await resetProventosData(request);
  await ensureDefaultPortfolio(request);
}

export async function seedProventosWithBbse3(request: APIRequestContext): Promise<number> {
  await resetProventosData(request);
  await createAssetViaApi(request, {
    symbol: TICKER_BBSE3,
    name: 'BB Seguridade Participações S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  return ensureDefaultPortfolio(request);
}

export async function seedProventosWithBbse3AndVoo(request: APIRequestContext): Promise<number> {
  await resetProventosData(request);
  await createAssetViaApi(request, {
    symbol: TICKER_BBSE3,
    name: 'BB Seguridade Participações S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  await createAssetViaApi(request, {
    symbol: TICKER_VOO,
    name: 'Vanguard S&P 500 ETF',
    asset_type: 'etf',
    market: 'international',
    country: 'US',
    currency: 'USD'
  });
  return ensureDefaultPortfolio(request);
}

export async function seedProventosWithItsa4(request: APIRequestContext): Promise<number> {
  await resetProventosData(request);
  await createAssetViaApi(request, {
    symbol: TICKER_ITSA4,
    name: 'Itaúsa S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  return ensureDefaultPortfolio(request);
}

export async function seedProventosWithOnePayment(
  request: APIRequestContext,
  options: {
    amount?: number;
    payment_date?: string;
    payment_type?: string;
  } = {}
): Promise<{ paymentId: number; portfolioId: number }> {
  const portfolioId = await seedProventosWithBbse3(request);
  const assetId = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const payment = await createDividendPaymentViaApi(request, {
    asset_id: assetId,
    portfolio_id: portfolioId,
    payment_type: options.payment_type ?? 'dividend',
    payment_date: options.payment_date ?? '2024-06-15',
    amount: options.amount ?? 150.75,
    currency: 'BRL'
  });
  return { paymentId: payment.id, portfolioId };
}

export async function seedProventosMultiForFilters(request: APIRequestContext): Promise<number> {
  const portfolioId = await seedProventosWithBbse3AndVoo(request);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);

  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2024-03-10',
    amount: 100,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    portfolio_id: portfolioId,
    payment_type: 'jcp',
    payment_date: '2024-08-20',
    amount: 50,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: vooId,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2024-05-01',
    amount: 25,
    currency: 'USD'
  });
  return portfolioId;
}

export async function seedProventosForSort(request: APIRequestContext): Promise<number> {
  const portfolioId = await seedProventosWithBbse3AndVoo(request);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);

  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2024-01-15',
    amount: 30,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: vooId,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2024-06-15',
    amount: 90,
    currency: 'USD'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    portfolio_id: portfolioId,
    payment_type: 'jcp',
    payment_date: '2024-12-01',
    amount: 60,
    currency: 'BRL'
  });
  return portfolioId;
}

export async function seedProventosForLabels(request: APIRequestContext): Promise<number> {
  const portfolioId = await seedProventosWithBbse3(request);
  const assetId = await getAssetIdBySymbol(request, TICKER_BBSE3);

  const types = ['dividend', 'jcp', 'credit', 'fraction', 'redemption', 'other'] as const;
  for (let i = 0; i < types.length; i += 1) {
    await createDividendPaymentViaApi(request, {
      asset_id: assetId,
      portfolio_id: portfolioId,
      payment_type: types[i],
      payment_date: `2024-0${i + 1}-10`,
      amount: 10 + i,
      currency: 'BRL'
    });
  }
  return portfolioId;
}

/**
 * Cenario UI-PRV-019: carteira ativa com dois ativos que pagaram proventos, mas apenas
 * um deles ainda tem posicao aberta. O ativo "vendido" (ITSA4) paga MAIS, para provar que:
 *  - totais/graficos usam o historico completo (inclui ITSA4);
 *  - "Maior pagador" e "Top ativos" usam apenas ativos em carteira (mostram BBSE3).
 */
export async function seedProventosHeldVsSold(request: APIRequestContext): Promise<number> {
  await resetProventosData(request);
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

  const portfolioId = await ensureDefaultPortfolio(request);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const itsa4Id = await getAssetIdBySymbol(request, TICKER_ITSA4);

  // Apenas BBSE3 permanece em carteira (posicao aberta). ITSA4 foi "vendido" (sem posicao).
  await request.post(`${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/positions`, {
    data: { asset_id: bbse3Id, quantity: 10, average_price: 30 }
  });

  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2024-03-10',
    amount: 100,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: itsa4Id,
    portfolio_id: portfolioId,
    payment_type: 'dividend',
    payment_date: '2024-04-10',
    amount: 500,
    currency: 'BRL'
  });

  return portfolioId;
}

/**
 * Cenario UI-PRV-015/016/017: duas carteiras compartilhando o mesmo ticker BBSE3,
 * com proventos distintos em cada uma e posicoes para aparecer na visao consolidada.
 */
export async function seedProventosSeparacaoPorCarteira(
  request: APIRequestContext
): Promise<{
  portfolioAId: number;
  portfolioBId: number;
  paymentAId: number;
  paymentBId: number;
}> {
  await resetProventosData(request);
  await createAssetViaApi(request, {
    symbol: TICKER_BBSE3,
    name: 'BB Seguridade Participações S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
  const portfolioA = await createPortfolio(request, 'Carteira A');
  const portfolioB = await createPortfolio(request, 'Carteira B');
  const assetId = await getAssetIdBySymbol(request, TICKER_BBSE3);

  // Posicoes para aparecer na visao consolidada de cada carteira.
  await request.post(`${getWorkerApiBaseUrl()}/portfolios/${portfolioA.id}/positions`, {
    data: { asset_id: assetId, quantity: 10, average_price: 30 }
  });
  await request.post(`${getWorkerApiBaseUrl()}/portfolios/${portfolioB.id}/positions`, {
    data: { asset_id: assetId, quantity: 5, average_price: 32 }
  });

  const paymentA = await createDividendPaymentViaApi(request, {
    asset_id: assetId,
    portfolio_id: portfolioA.id,
    payment_type: 'dividend',
    payment_date: '2024-04-10',
    amount: 50,
    currency: 'BRL'
  });
  const paymentB = await createDividendPaymentViaApi(request, {
    asset_id: assetId,
    portfolio_id: portfolioB.id,
    payment_type: 'dividend',
    payment_date: '2024-05-15',
    amount: 12,
    currency: 'BRL'
  });

  await setActivePortfolio(request, portfolioA.id);

  return {
    portfolioAId: portfolioA.id,
    portfolioBId: portfolioB.id,
    paymentAId: paymentA.id,
    paymentBId: paymentB.id
  };
}
