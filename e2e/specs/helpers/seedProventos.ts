import type { APIRequestContext } from '@playwright/test';

import { API_BASE_URL } from './apiResponses';
import { TICKER_BBSE3, TICKER_ITSA4, TICKER_VOO } from './e2eFixtures';
import { clearAllTestAssets, createAssetViaApi } from './seedAssets';
import { clearAllDividendPayments, createDividendPaymentViaApi } from './testDividendPayments';
import { getAssetIdBySymbol } from './testPortfolios';

async function resetProventosData(request: APIRequestContext): Promise<void> {
  await clearAllDividendPayments(request);
  await clearAllTestAssets(request, API_BASE_URL);
}

export async function seedProventosEmpty(request: APIRequestContext): Promise<void> {
  await resetProventosData(request);
}

export async function seedProventosWithBbse3(request: APIRequestContext): Promise<void> {
  await resetProventosData(request);
  await createAssetViaApi(request, {
    symbol: TICKER_BBSE3,
    name: 'BB Seguridade Participações S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
}

export async function seedProventosWithBbse3AndVoo(request: APIRequestContext): Promise<void> {
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
}

export async function seedProventosWithItsa4(request: APIRequestContext): Promise<void> {
  await resetProventosData(request);
  await createAssetViaApi(request, {
    symbol: TICKER_ITSA4,
    name: 'Itaúsa S.A.',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL'
  });
}

export async function seedProventosWithOnePayment(
  request: APIRequestContext,
  options: {
    amount?: number;
    payment_date?: string;
    payment_type?: string;
  } = {}
): Promise<{ paymentId: number }> {
  await seedProventosWithBbse3(request);
  const assetId = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const payment = await createDividendPaymentViaApi(request, {
    asset_id: assetId,
    payment_type: options.payment_type ?? 'dividend',
    payment_date: options.payment_date ?? '2024-06-15',
    amount: options.amount ?? 150.75,
    currency: 'BRL'
  });
  return { paymentId: payment.id };
}

export async function seedProventosMultiForFilters(request: APIRequestContext): Promise<void> {
  await seedProventosWithBbse3AndVoo(request);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);

  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    payment_type: 'dividend',
    payment_date: '2024-03-10',
    amount: 100,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    payment_type: 'jcp',
    payment_date: '2024-08-20',
    amount: 50,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: vooId,
    payment_type: 'dividend',
    payment_date: '2024-05-01',
    amount: 25,
    currency: 'USD'
  });
}

export async function seedProventosForSort(request: APIRequestContext): Promise<void> {
  await seedProventosWithBbse3AndVoo(request);
  const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
  const vooId = await getAssetIdBySymbol(request, TICKER_VOO);

  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    payment_type: 'dividend',
    payment_date: '2024-01-15',
    amount: 30,
    currency: 'BRL'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: vooId,
    payment_type: 'dividend',
    payment_date: '2024-06-15',
    amount: 90,
    currency: 'USD'
  });
  await createDividendPaymentViaApi(request, {
    asset_id: bbse3Id,
    payment_type: 'jcp',
    payment_date: '2024-12-01',
    amount: 60,
    currency: 'BRL'
  });
}

export async function seedProventosForLabels(request: APIRequestContext): Promise<void> {
  await seedProventosWithBbse3(request);
  const assetId = await getAssetIdBySymbol(request, TICKER_BBSE3);

  const types = ['dividend', 'jcp', 'credit', 'fraction', 'redemption', 'other'] as const;
  for (let i = 0; i < types.length; i += 1) {
    await createDividendPaymentViaApi(request, {
      asset_id: assetId,
      payment_type: types[i],
      payment_date: `2024-0${i + 1}-10`,
      amount: 10 + i,
      currency: 'BRL'
    });
  }
}
