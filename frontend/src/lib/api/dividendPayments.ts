import type { AssetMarket } from './assets';
import { API_BASE_URL } from './config';
import { apiFetch } from './http';
import type { DividendPaymentType } from '$lib/proventoLabels';

type ApiFetcher = typeof fetch;

export type DividendPayment = {
  id: number;
  asset_id: number;
  portfolio_id: number | null;
  payment_type: DividendPaymentType;
  payment_date: string;
  amount: number;
  gross_amount?: number | null;
  tax_withheld?: number | null;
  currency: string;
  notes?: string | null;
  company_cnpj?: string | null;
  payer_cnpj?: string | null;
  payer_name?: string | null;
  symbol: string;
  asset_name: string;
  market: AssetMarket;
  display_class: string;
};

export type DividendPaymentCreate = {
  asset_id: number;
  portfolio_id: number | null;
  payment_type: DividendPaymentType;
  payment_date: string;
  amount: number;
  gross_amount?: number | null;
  tax_withheld?: number | null;
  currency: string;
  notes?: string | null;
  company_cnpj?: string | null;
  payer_cnpj?: string | null;
  payer_name?: string | null;
};

export type DividendPaymentUpdate = Partial<DividendPaymentCreate>;

export type DividendPaymentListParams = {
  asset_id?: number;
  portfolio_id?: number;
  payment_type?: DividendPaymentType;
  market?: AssetMarket;
  from_date?: string;
  to_date?: string;
  symbol?: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

function buildQuery(params?: DividendPaymentListParams): string {
  if (!params) {
    return '';
  }
  const search = new URLSearchParams();
  if (params.asset_id != null) {
    search.set('asset_id', String(params.asset_id));
  }
  if (params.portfolio_id != null) {
    search.set('portfolio_id', String(params.portfolio_id));
  }
  if (params.payment_type) {
    search.set('payment_type', params.payment_type);
  }
  if (params.market) {
    search.set('market', params.market);
  }
  if (params.from_date) {
    search.set('from_date', params.from_date);
  }
  if (params.to_date) {
    search.set('to_date', params.to_date);
  }
  if (params.symbol?.trim()) {
    search.set('symbol', params.symbol.trim());
  }
  const qs = search.toString();
  return qs ? `?${qs}` : '';
}

export async function listDividendPayments(
  params?: DividendPaymentListParams,
  fetcher: ApiFetcher = apiFetch
): Promise<DividendPayment[]> {
  const response = await fetcher(`${API_BASE_URL}/dividend-payments${buildQuery(params)}`);
  return parseResponse<DividendPayment[]>(response);
}

export async function createDividendPayment(
  payload: DividendPaymentCreate,
  fetcher: ApiFetcher = apiFetch
): Promise<DividendPayment> {
  const response = await fetcher(`${API_BASE_URL}/dividend-payments`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<DividendPayment>(response);
}

export async function updateDividendPayment(
  id: number,
  payload: DividendPaymentUpdate,
  fetcher: ApiFetcher = apiFetch
): Promise<DividendPayment> {
  const response = await fetcher(`${API_BASE_URL}/dividend-payments/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<DividendPayment>(response);
}

export async function deleteDividendPayment(
  id: number,
  fetcher: ApiFetcher = apiFetch
): Promise<void> {
  const response = await fetcher(`${API_BASE_URL}/dividend-payments/${id}`, {
    method: 'DELETE'
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export type BulkDividendImportRow = {
  row_index: number;
  symbol: string;
  payment_type: DividendPaymentType;
  payment_date: string;
  amount: number;
  currency?: string | null;
  notes?: string | null;
  company_cnpj?: string | null;
  payer_cnpj?: string | null;
  payer_name?: string | null;
};

export type BulkDividendPreviewItem = {
  row_index: number;
  symbol: string;
  status: 'ready' | 'error' | 'duplicate' | string;
  detail?: string | null;
  payload?: DividendPaymentCreate | null;
};

export type BulkDividendPreviewResponse = {
  items: BulkDividendPreviewItem[];
};

export type BulkDividendCreateItemResult = {
  row_index?: number | null;
  symbol: string;
  status: 'created' | 'skipped' | 'error' | string;
  payment?: DividendPayment;
  detail?: string | null;
};

export type BulkDividendCreateResponse = {
  results: BulkDividendCreateItemResult[];
};

export async function previewBulkDividendPayments(
  items: BulkDividendImportRow[],
  options: { portfolio_id?: number | null } = {},
  fetcher: ApiFetcher = apiFetch
): Promise<BulkDividendPreviewResponse> {
  const body: Record<string, unknown> = { items };
  if (options.portfolio_id != null) {
    body.portfolio_id = options.portfolio_id;
  }
  const response = await fetcher(`${API_BASE_URL}/dividend-payments/bulk/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return parseResponse<BulkDividendPreviewResponse>(response);
}

export async function createBulkDividendPayments(
  payments: DividendPaymentCreate[],
  options: { portfolio_id: number },
  fetcher: ApiFetcher = apiFetch
): Promise<BulkDividendCreateResponse> {
  const response = await fetcher(`${API_BASE_URL}/dividend-payments/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payments, portfolio_id: options.portfolio_id })
  });
  return parseResponse<BulkDividendCreateResponse>(response);
}
