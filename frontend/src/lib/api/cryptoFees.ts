import { API_BASE_URL } from './config';
import { apiFetch } from './http';

type ApiFetcher = typeof apiFetch;

export type CryptoFeeType = 'purchase' | 'transfer';

export type CryptoFee = {
  id: number;
  portfolio_id: number;
  asset_id: number;
  fee_type: CryptoFeeType;
  fee_date: string;
  quantity_moved: number;
  fee_quantity_btc: number;
  quote_brl: number;
  fx_rate: number;
  notes?: string | null;
  symbol: string;
  asset_name: string;
  final_quantity_after_fee: number;
  fee_value_brl: number;
  fee_value_usd: number;
  fee_percent: number;
};

export type CryptoFeeCreate = {
  portfolio_id: number;
  asset_id: number;
  fee_type: CryptoFeeType;
  fee_date: string;
  quantity_moved: number;
  fee_quantity_btc: number;
  quote_brl: number;
  fx_rate: number;
  notes?: string | null;
};

export type CryptoFeeUpdate = Partial<CryptoFeeCreate>;

export type CryptoFeeListParams = {
  portfolio_id?: number;
  asset_id?: number;
  fee_type?: CryptoFeeType;
  from_date?: string;
  to_date?: string;
};

export type BitcoinPositionSummary = {
  asset_id: number | null;
  symbol: string | null;
  name: string | null;
  quantity: number | null;
  average_price_brl: number | null;
  average_price_usd: number | null;
  total_invested_brl: number | null;
  quote_brl: number | null;
  quote_usd: number | null;
  current_value_brl: number | null;
  profit_brl: number | null;
  profit_percent: number | null;
};

export type BitcoinRebalanceSummary = {
  target_value_brl: number | null;
  missing_value_brl: number | null;
  above_target_brl: number | null;
  rebalance_action: string | null;
};

export type BitcoinSnapshot = {
  portfolio_id: number;
  position: BitcoinPositionSummary;
  rebalance: BitcoinRebalanceSummary;
  total_fees_brl: number;
  total_fees_usd: number;
  profit_after_fees_brl: number | null;
  appreciation_after_fees_percent: number | null;
  transfer_ledger_final_btc: number;
  transfer_ledger_count: number;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

function buildQuery(params?: CryptoFeeListParams): string {
  if (!params) {
    return '';
  }
  const search = new URLSearchParams();
  if (params.portfolio_id != null) {
    search.set('portfolio_id', String(params.portfolio_id));
  }
  if (params.asset_id != null) {
    search.set('asset_id', String(params.asset_id));
  }
  if (params.fee_type) {
    search.set('fee_type', params.fee_type);
  }
  if (params.from_date) {
    search.set('from_date', params.from_date);
  }
  if (params.to_date) {
    search.set('to_date', params.to_date);
  }
  const query = search.toString();
  return query ? `?${query}` : '';
}

export async function listCryptoFees(
  params?: CryptoFeeListParams,
  fetcher: ApiFetcher = apiFetch
): Promise<CryptoFee[]> {
  const response = await fetcher(`${API_BASE_URL}/crypto-fees${buildQuery(params)}`);
  return parseResponse(response);
}

export async function createCryptoFee(
  payload: CryptoFeeCreate,
  fetcher: ApiFetcher = apiFetch
): Promise<CryptoFee> {
  const response = await fetcher(`${API_BASE_URL}/crypto-fees`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function updateCryptoFee(
  id: number,
  payload: CryptoFeeUpdate,
  fetcher: ApiFetcher = apiFetch
): Promise<CryptoFee> {
  const response = await fetcher(`${API_BASE_URL}/crypto-fees/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse(response);
}

export async function deleteCryptoFee(id: number, fetcher: ApiFetcher = apiFetch): Promise<void> {
  const response = await fetcher(`${API_BASE_URL}/crypto-fees/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function getBitcoinSnapshot(
  portfolioId: number,
  assetId?: number,
  fetcher: ApiFetcher = apiFetch
): Promise<BitcoinSnapshot> {
  const search = assetId != null ? `?asset_id=${assetId}` : '';
  const response = await fetcher(
    `${API_BASE_URL}/portfolios/${portfolioId}/bitcoin-snapshot${search}`
  );
  return parseResponse(response);
}
