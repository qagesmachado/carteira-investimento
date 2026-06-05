import { expect, type APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';

export type DividendPaymentSeedPayload = {
  asset_id: number;
  portfolio_id: number;
  payment_type: string;
  payment_date: string;
  amount: number;
  currency: string;
  notes?: string | null;
};

export async function listDividendPaymentsViaApi(
  request: APIRequestContext
): Promise<{ id: number }[]> {
  const response = await request.get(`${getWorkerApiBaseUrl()}/dividend-payments`);
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as { id: number }[];
}

export async function clearAllDividendPayments(request: APIRequestContext): Promise<void> {
  const payments = await listDividendPaymentsViaApi(request);
  for (const payment of payments) {
    const deleteResponse = await request.delete(`${getWorkerApiBaseUrl()}/dividend-payments/${payment.id}`);
    expect(deleteResponse.ok()).toBeTruthy();
  }
}

export async function createDividendPaymentViaApi(
  request: APIRequestContext,
  payload: DividendPaymentSeedPayload
): Promise<{ id: number; symbol: string; amount: number; payment_date: string }> {
  const response = await request.post(`${getWorkerApiBaseUrl()}/dividend-payments`, { data: payload });
  expect(response.ok()).toBeTruthy();
  return (await response.json()) as {
    id: number;
    symbol: string;
    amount: number;
    payment_date: string;
  };
}
