import type { Asset, DisplayClass } from '$lib/api/assets';
import type { AssetPartition } from '$lib/api/objetivos';
import type { Position } from '$lib/api/portfolios';
import { formatDisplayClassForDisplay } from '$lib/assetLabels';
import { consolidadaHref } from '$lib/routes/appRoutes';

import {
  positionCurrentValue,
  positionInvestedValue,
  valueInBrl
} from '$lib/features/portfolios/positionMetrics';

import type { DashboardPatrimonyFilters } from './dashboardPatrimonyFilters';
import { DEFAULT_DASHBOARD_PATRIMONY_FILTERS } from './dashboardPatrimonyFilters';
import {
  resolvePositionCurrentBrlForDashboard,
  resolvePositionInvestedBrlForDashboard,
  isPositionIncludedInDashboardPatrimonyScope
} from './dashboardPatrimonyScope';

export type DashboardPatrimony = {
  investedBrl: number;
  currentBrl: number;
  profitBrl: number;
  profitPercent: number | null;
  activePositions: number;
};

export type AllocationRow = {
  displayClass: DisplayClass;
  label: string;
  valueBrl: number;
  percent: number;
};

export type ClassGrossReturnRow = {
  displayClass: DisplayClass;
  label: string;
  investedBrl: number;
  currentBrl: number;
  profitBrl: number;
  profitPercent: number;
};

export const MAX_FEATURED_GROSS_RETURN_CLASSES = 3;

export const FEATURED_CLASS_MEDAL_ACCENTS = [
  { bgClass: 'bg-amber-400/20', fgClass: 'text-amber-600' },
  { bgClass: 'bg-slate-400/20', fgClass: 'text-slate-600' },
  { bgClass: 'bg-orange-600/20', fgClass: 'text-orange-700' }
] as const;

export function computeDashboardPatrimony(
  positions: Position[],
  assetById: Record<number, Asset>,
  usdBrlRate: number | null | undefined,
  partitionsByAssetId: Record<number, AssetPartition> = {},
  filters: DashboardPatrimonyFilters = DEFAULT_DASHBOARD_PATRIMONY_FILTERS
): DashboardPatrimony {
  let investedBrl = 0;
  let currentBrl = 0;
  let activePositions = 0;

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }

    const partition = partitionsByAssetId[position.asset_id];
    if (
      isPositionIncludedInDashboardPatrimonyScope(
        position,
        asset,
        usdBrlRate,
        partition,
        filters
      )
    ) {
      activePositions += 1;
    }

    const invBrl = resolvePositionInvestedBrlForDashboard(
      position,
      asset,
      usdBrlRate,
      partition,
      filters
    );
    const curBrl = resolvePositionCurrentBrlForDashboard(
      position,
      asset,
      usdBrlRate,
      partition,
      filters
    );
    if (invBrl != null) {
      investedBrl += invBrl;
    }
    if (curBrl != null) {
      currentBrl += curBrl;
    }
  }

  const profitBrl = currentBrl - investedBrl;
  const profitPercent = investedBrl > 0 ? (profitBrl / investedBrl) * 100 : null;

  return {
    investedBrl,
    currentBrl,
    profitBrl,
    profitPercent,
    activePositions
  };
}

export function computeAllocationByDisplayClass(
  positions: Position[],
  assetById: Record<number, Asset>,
  usdBrlRate: number | null | undefined,
  partitionsByAssetId: Record<number, AssetPartition> = {},
  filters: DashboardPatrimonyFilters = DEFAULT_DASHBOARD_PATRIMONY_FILTERS
): AllocationRow[] {
  const byClass = new Map<DisplayClass, number>();

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }
    const partition = partitionsByAssetId[position.asset_id];
    const brl = resolvePositionCurrentBrlForDashboard(
      position,
      asset,
      usdBrlRate,
      partition,
      filters
    );
    if (brl == null || brl <= 0) {
      continue;
    }
    byClass.set(asset.display_class, (byClass.get(asset.display_class) ?? 0) + brl);
  }

  const total = [...byClass.values()].reduce((s, v) => s + v, 0);
  if (total <= 0) {
    return [];
  }

  return [...byClass.entries()]
    .map(([displayClass, valueBrl]) => ({
      displayClass,
      label: formatDisplayClassForDisplay(displayClass),
      valueBrl,
      percent: (valueBrl / total) * 100
    }))
    .sort((a, b) => b.valueBrl - a.valueBrl);
}

export function computeGrossReturnByDisplayClass(
  positions: Position[],
  assetById: Record<number, Asset>,
  usdBrlRate: number | null | undefined
): ClassGrossReturnRow[] {
  const byClass = new Map<
    DisplayClass,
    {
      investedBrl: number;
      currentBrl: number;
    }
  >();

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset) {
      continue;
    }

    const invested = positionInvestedValue(position, asset);
    const current = positionCurrentValue(position, asset);
    if (invested == null || current == null) {
      continue;
    }

    const investedBrl = valueInBrl(invested, asset.currency, usdBrlRate);
    const currentBrl = valueInBrl(current, asset.currency, usdBrlRate);
    if (investedBrl == null || currentBrl == null) {
      continue;
    }

    const bucket = byClass.get(asset.display_class) ?? { investedBrl: 0, currentBrl: 0 };
    bucket.investedBrl += investedBrl;
    bucket.currentBrl += currentBrl;
    byClass.set(asset.display_class, bucket);
  }

  return [...byClass.entries()]
    .map(([displayClass, totals]) => {
      const profitBrl = totals.currentBrl - totals.investedBrl;
      const profitPercent =
        totals.investedBrl > 0 ? (profitBrl / totals.investedBrl) * 100 : 0;
      return {
        displayClass,
        label: formatDisplayClassForDisplay(displayClass),
        investedBrl: totals.investedBrl,
        currentBrl: totals.currentBrl,
        profitBrl,
        profitPercent
      };
    })
    .filter((row) => row.investedBrl > 0)
    .sort((a, b) => b.profitPercent - a.profitPercent);
}

export function pickTopGrossReturnClasses(
  rows: ClassGrossReturnRow[],
  limit = MAX_FEATURED_GROSS_RETURN_CLASSES
): ClassGrossReturnRow[] {
  return rows.slice(0, limit);
}

export function formatGrossReturnPercent(percent: number): string {
  const sign = percent >= 0 ? '+' : '';
  return `${sign}${percent.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
}

export function grossReturnPercentClass(percent: number): string {
  return percent >= 0 ? 'text-success' : 'text-error';
}

export function featuredClassConsolidadaHref(displayClass: DisplayClass): string {
  return consolidadaHref(displayClass);
}
