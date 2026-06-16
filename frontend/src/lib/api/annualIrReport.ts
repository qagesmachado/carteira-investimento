import type { AssetMarket, AssetType, DisplayClass } from '$lib/api/assets';
import { API_BASE_URL } from '$lib/api/config';
import type { DividendPaymentType } from '$lib/proventoLabels';

export type AnnualIrPaymentRow = {
  symbol: string;
  asset_name: string;
  asset_type: AssetType;
  display_class: DisplayClass;
  market: AssetMarket;
  payment_type: DividendPaymentType;
  payment_date: string;
  amount: number;
  currency: string;
  company_cnpj?: string | null;
  payer_cnpj?: string | null;
  payer_name?: string | null;
};

export type AnnualIrSummaryByAsset = {
  asset_id: number;
  symbol: string;
  asset_name: string;
  asset_type: AssetType;
  display_class: DisplayClass;
  totals_by_type: Record<string, number>;
  total_by_currency: Record<string, number>;
};

export type AnnualIrPositionRow = {
  symbol: string;
  asset_name: string;
  asset_type: AssetType;
  display_class: DisplayClass;
  quantity: number;
  average_price: number;
  currency: string;
  invested_amount?: number | null;
};

export type AnnualIrReport = {
  year: number;
  portfolio_id: number;
  has_position_snapshot: boolean;
  snapshot_date?: string | null;
  payments: AnnualIrPaymentRow[];
  summary_by_asset: AnnualIrSummaryByAsset[];
  positions: AnnualIrPositionRow[];
  grand_totals_by_type: Record<string, Record<string, number>>;
};

export type YearSnapshotSummary = {
  id: number;
  portfolio_id: number;
  year: number;
  snapshot_date: string;
  created_at: string;
  position_count: number;
};

export type YearSnapshotCreate = {
  year: number;
  snapshot_date?: string | null;
  replace?: boolean;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function getAnnualIrReport(
  portfolioId: number,
  year: number,
  fetcher: typeof fetch = fetch
): Promise<AnnualIrReport> {
  const response = await fetcher(
    `${API_BASE_URL}/portfolios/${portfolioId}/annual-ir-report?year=${year}`
  );
  return parseResponse<AnnualIrReport>(response);
}

export async function listYearSnapshots(
  portfolioId: number,
  fetcher: typeof fetch = fetch
): Promise<YearSnapshotSummary[]> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/${portfolioId}/year-snapshots`);
  return parseResponse<YearSnapshotSummary[]>(response);
}

export async function createYearSnapshot(
  portfolioId: number,
  payload: YearSnapshotCreate,
  fetcher: typeof fetch = fetch
): Promise<void> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/${portfolioId}/year-snapshots`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export function getAnnualIrReportCsvUrl(portfolioId: number, year: number): string {
  return `${API_BASE_URL}/portfolios/${portfolioId}/annual-ir-report/export?year=${year}&format=csv`;
}
