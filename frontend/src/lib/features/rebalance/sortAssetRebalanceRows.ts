import type { AssetRebalanceRow } from '$lib/api/rebalance';
import { formatAssetTypeForDisplay } from '$lib/assetLabels';

import { computeAssetInvestmentAllocation } from './investmentAllocation';

export type AssetRebalanceSortKey =
  | 'symbol'
  | 'asset_type'
  | 'current_value_brl'
  | 'current_percent'
  | 'sum_score'
  | 'target_percent'
  | 'target_value_brl'
  | 'gap_brl'
  | 'ideal_target'
  | 'suggested_contribution';

export type SortDirection = 'asc' | 'desc';

export type SortInvestmentContext = {
  currentPatrimonyBrl: number | null;
  finalPatrimonyBrl: number | null;
  classContributionBrl: number | null;
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

function buildAllocationMap(
  rows: AssetRebalanceRow[],
  context: SortInvestmentContext
): Map<number, { idealTargetBrl: number | null; suggestedContributionBrl: number | null }> | null {
  if (
    context.currentPatrimonyBrl == null ||
    context.finalPatrimonyBrl == null ||
    context.classContributionBrl == null
  ) {
    return null;
  }
  return computeAssetInvestmentAllocation(
    rows,
    context.classContributionBrl,
    context.currentPatrimonyBrl,
    context.finalPatrimonyBrl
  );
}

function allocationValue(
  row: AssetRebalanceRow,
  allocationMap: Map<
    number,
    { idealTargetBrl: number | null; suggestedContributionBrl: number | null }
  > | null,
  field: 'idealTargetBrl' | 'suggestedContributionBrl'
): number | null {
  if (allocationMap == null) {
    return null;
  }
  return allocationMap.get(row.asset_id)?.[field] ?? null;
}

export function sortAssetRebalanceRows(
  rows: AssetRebalanceRow[],
  key: AssetRebalanceSortKey,
  direction: SortDirection,
  context: SortInvestmentContext = {
    currentPatrimonyBrl: null,
    finalPatrimonyBrl: null,
    classContributionBrl: null
  }
): AssetRebalanceRow[] {
  const factor = direction === 'asc' ? 1 : -1;
  const allocationMap =
    key === 'ideal_target' || key === 'suggested_contribution'
      ? buildAllocationMap(rows, context)
      : null;

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
      case 'ideal_target':
        cmp = compareNullableNumber(
          allocationValue(a, allocationMap, 'idealTargetBrl'),
          allocationValue(b, allocationMap, 'idealTargetBrl'),
          factor
        );
        break;
      case 'suggested_contribution':
        cmp = compareNullableNumber(
          allocationValue(a, allocationMap, 'suggestedContributionBrl'),
          allocationValue(b, allocationMap, 'suggestedContributionBrl'),
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
