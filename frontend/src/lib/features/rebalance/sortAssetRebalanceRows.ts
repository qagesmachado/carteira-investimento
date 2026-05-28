import type { AssetRebalanceRow } from '$lib/api/rebalance';
import { formatAssetTypeForDisplay } from '$lib/assetLabels';

import { computeProjectedAssetGap } from './projectedRebalance';

export type AssetRebalanceSortKey =
  | 'symbol'
  | 'asset_type'
  | 'current_value_brl'
  | 'current_percent'
  | 'sum_score'
  | 'target_percent'
  | 'target_value_brl'
  | 'gap_brl'
  | 'projected_gap';

export type SortDirection = 'asc' | 'desc';

export type SortProjectedGapContext = {
  currentPatrimonyBrl: number | null;
  finalPatrimonyBrl: number | null;
};

function compareNullableNumber(
  a: number | null,
  b: number | null,
  factor: number
): number {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  return (a - b) * factor;
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function projectedGap(
  row: AssetRebalanceRow,
  context: SortProjectedGapContext
): number | null {
  return computeProjectedAssetGap(
    row.current_value_brl,
    row.target_value_brl,
    context.currentPatrimonyBrl,
    context.finalPatrimonyBrl
  );
}

export function sortAssetRebalanceRows(
  rows: AssetRebalanceRow[],
  key: AssetRebalanceSortKey,
  direction: SortDirection,
  context: SortProjectedGapContext = { currentPatrimonyBrl: null, finalPatrimonyBrl: null }
): AssetRebalanceRow[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'symbol':
        cmp = compareText(a.symbol, b.symbol);
        break;
      case 'asset_type':
        cmp = compareText(
          formatAssetTypeForDisplay(a.asset_type),
          formatAssetTypeForDisplay(b.asset_type)
        );
        break;
      case 'current_value_brl':
        cmp = compareNullableNumber(a.current_value_brl, b.current_value_brl, factor);
        break;
      case 'current_percent':
        cmp = compareNullableNumber(a.current_percent, b.current_percent, factor);
        break;
      case 'sum_score':
        cmp = compareNullableNumber(a.sum_score, b.sum_score, factor);
        break;
      case 'target_percent':
        cmp = compareNullableNumber(a.target_percent, b.target_percent, factor);
        break;
      case 'target_value_brl':
        cmp = compareNullableNumber(a.target_value_brl, b.target_value_brl, factor);
        break;
      case 'gap_brl':
        cmp = compareNullableNumber(a.gap_brl, b.gap_brl, factor);
        break;
      case 'projected_gap':
        cmp = compareNullableNumber(
          projectedGap(a, context),
          projectedGap(b, context),
          factor
        );
        break;
      default:
        cmp = 0;
    }

    if (cmp === 0 && key !== 'symbol') {
      cmp = compareText(a.symbol, b.symbol);
    }

    if (key === 'symbol' || key === 'asset_type') {
      return cmp * factor;
    }

    return cmp;
  });
}

export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}
