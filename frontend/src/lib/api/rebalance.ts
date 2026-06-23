import { API_BASE_URL } from './config';

export type ApiFetcher = typeof fetch;

export type ClassRebalanceRow = {
  display_class: string;
  label: string;
  current_value_brl: number;
  current_percent: number;
  target_percent: number;
  target_value_brl: number;
  gap_brl: number;
};

export type StocksSubTypeRebalanceRow = {
  sub_type: string;
  label: string;
  current_value_brl: number;
  current_percent_of_stocks: number;
  target_percent_of_stocks: number;
  target_value_brl: number;
  gap_brl: number;
};

export type AssetRebalanceRow = {
  asset_id: number;
  symbol: string;
  name: string;
  asset_type: string;
  current_value_brl: number;
  current_percent: number;
  target_percent: number | null;
  target_value_brl: number | null;
  gap_brl: number | null;
  sum_score: number | null;
  score_included: boolean;
};

export type RebalanceSnapshot = {
  portfolio_id: number;
  patrimony_brl: number;
  usd_brl_rate: number | null;
  classes: ClassRebalanceRow[];
  stocks_sub_types: StocksSubTypeRebalanceRow[];
  stock_assets: AssetRebalanceRow[];
  international_assets: AssetRebalanceRow[];
  fund_assets: AssetRebalanceRow[];
  crypto_assets: AssetRebalanceRow[];
  total_gap_brl: number;
  assets_without_score_count: number;
  fund_assets_without_score_count: number;
  crypto_assets_without_allocation_count: number;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function getPortfolioRebalance(
  portfolioId: number,
  fetcher: ApiFetcher = fetch
): Promise<RebalanceSnapshot> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/${portfolioId}/rebalance`);
  return parseResponse<RebalanceSnapshot>(response);
}
