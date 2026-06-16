import type { AssetMarket, AssetType } from '$lib/api/assets';
import type {
  AnnualIrPaymentRow,
  AnnualIrPositionRow,
  AnnualIrSummaryByAsset
} from '$lib/api/annualIrReport';
import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
import type { DividendPaymentType } from '$lib/proventoLabels';

export type SortDirection = 'asc' | 'desc';

export type AnnualIrPaymentSortKey =
  | 'symbol'
  | 'asset_type'
  | 'market'
  | 'payment_type'
  | 'payment_date'
  | 'amount';

export type AnnualIrSummarySortKey = 'symbol' | 'asset_type' | 'total';

export type AnnualIrPositionSortKey =
  | 'symbol'
  | 'asset_type'
  | 'quantity'
  | 'average_price'
  | 'invested_amount';

export function annualIrPositionInvestedAmount(position: AnnualIrPositionRow): number {
  return position.invested_amount ?? position.quantity * position.average_price;
}

export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}

export function filterAnnualIrPayments(
  payments: AnnualIrPaymentRow[],
  filters: {
    assetType?: AssetType | '';
    paymentType?: DividendPaymentType | '';
    market?: AssetMarket | '';
  }
): AnnualIrPaymentRow[] {
  return payments.filter((payment) => {
    if (filters.assetType && payment.asset_type !== filters.assetType) {
      return false;
    }
    if (filters.paymentType && payment.payment_type !== filters.paymentType) {
      return false;
    }
    if (filters.market && payment.market !== filters.market) {
      return false;
    }
    return true;
  });
}

export function filterAnnualIrSummary(
  rows: AnnualIrSummaryByAsset[],
  assetType?: AssetType | ''
): AnnualIrSummaryByAsset[] {
  if (!assetType) {
    return rows;
  }
  return rows.filter((row) => row.asset_type === assetType);
}

const EXCLUDED_POSITION_ASSET_TYPES = new Set<AssetType>(['fixed_income', 'pension']);

export function excludeFixedIncomePositions(
  positions: AnnualIrPositionRow[]
): AnnualIrPositionRow[] {
  return positions.filter((position) => !EXCLUDED_POSITION_ASSET_TYPES.has(position.asset_type));
}

export function sortAnnualIrPayments(
  payments: AnnualIrPaymentRow[],
  key: AnnualIrPaymentSortKey,
  direction: SortDirection
): AnnualIrPaymentRow[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...payments].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'symbol':
        cmp = formatTickerForDisplay(a.symbol).localeCompare(
          formatTickerForDisplay(b.symbol),
          'pt-BR'
        );
        break;
      case 'asset_type':
        cmp = a.asset_type.localeCompare(b.asset_type);
        break;
      case 'market':
        cmp = a.market.localeCompare(b.market);
        break;
      case 'payment_type':
        cmp = a.payment_type.localeCompare(b.payment_type);
        break;
      case 'payment_date':
        cmp = a.payment_date.localeCompare(b.payment_date);
        break;
      case 'amount':
        cmp = a.amount - b.amount;
        break;
      default:
        cmp = 0;
    }
    if (cmp === 0 && key !== 'payment_date') {
      cmp = a.payment_date.localeCompare(b.payment_date);
    }
    return cmp * factor;
  });
}

export type AnnualIrSummaryRow = AnnualIrSummaryByAsset & {
  currency: string;
  total: number;
};

export function flattenAnnualIrSummary(rows: AnnualIrSummaryByAsset[]): AnnualIrSummaryRow[] {
  const flattened: AnnualIrSummaryRow[] = [];
  for (const row of rows) {
    for (const [currency, total] of Object.entries(row.total_by_currency).sort(([a], [b]) =>
      a.localeCompare(b, 'pt-BR')
    )) {
      flattened.push({ ...row, currency, total });
    }
  }
  return flattened;
}

export function sortAnnualIrSummaryRows(
  rows: AnnualIrSummaryRow[],
  key: AnnualIrSummarySortKey,
  direction: SortDirection
): AnnualIrSummaryRow[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'symbol':
        cmp = formatTickerForDisplay(a.symbol).localeCompare(
          formatTickerForDisplay(b.symbol),
          'pt-BR'
        );
        break;
      case 'asset_type':
        cmp = a.asset_type.localeCompare(b.asset_type);
        break;
      case 'total':
        cmp = a.total - b.total;
        break;
      default:
        cmp = 0;
    }
    if (cmp === 0 && key !== 'symbol') {
      cmp = formatTickerForDisplay(a.symbol).localeCompare(
        formatTickerForDisplay(b.symbol),
        'pt-BR'
      );
    }
    return cmp * factor;
  });
}

export function sortAnnualIrPositions(
  positions: AnnualIrPositionRow[],
  key: AnnualIrPositionSortKey,
  direction: SortDirection
): AnnualIrPositionRow[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...positions].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'symbol':
        cmp = formatTickerForDisplay(a.symbol).localeCompare(
          formatTickerForDisplay(b.symbol),
          'pt-BR'
        );
        break;
      case 'asset_type':
        cmp = a.asset_type.localeCompare(b.asset_type);
        break;
      case 'quantity':
        cmp = a.quantity - b.quantity;
        break;
      case 'average_price':
        cmp = a.average_price - b.average_price;
        break;
      case 'invested_amount':
        cmp = annualIrPositionInvestedAmount(a) - annualIrPositionInvestedAmount(b);
        break;
      default:
        cmp = 0;
    }
    return cmp * factor;
  });
}
