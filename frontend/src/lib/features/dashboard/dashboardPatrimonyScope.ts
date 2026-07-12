import type { Asset } from '$lib/api/assets';
import type { AssetPartition } from '$lib/api/objetivos';
import type { Position } from '$lib/api/portfolios';
import {
  computeExcludedRebalanceBrl,
  computeInvestmentValueBrl
} from '$lib/features/portfolios/positionPurpose';
import {
  positionCurrentValue,
  positionInvestedValue,
  valueInBrl
} from '$lib/features/portfolios/positionMetrics';

import type { DashboardPatrimonyFilters } from './dashboardPatrimonyFilters';
import { DEFAULT_DASHBOARD_PATRIMONY_FILTERS } from './dashboardPatrimonyFilters';

export function isPensionAsset(asset: Asset): boolean {
  return asset.asset_type === 'pension' || asset.display_class === 'pension';
}

function applyNonInvestmentScope(
  currentBrl: number,
  partition: AssetPartition | undefined,
  filters: DashboardPatrimonyFilters
): number {
  if (filters.includeNonInvestment || currentBrl <= 0) {
    return currentBrl;
  }
  const excluded = computeExcludedRebalanceBrl(partition);
  return computeInvestmentValueBrl(currentBrl, excluded) ?? 0;
}

export type DashboardPatrimonyFilterAvailability = {
  hasNonInvestment: boolean;
  hasPension: boolean;
};

export function computeDashboardPatrimonyFilterAvailability(
  positions: Position[],
  assetById: Record<number, Asset>,
  partitionsByAssetId: Record<number, AssetPartition>
): DashboardPatrimonyFilterAvailability {
  let hasNonInvestment = false;
  let hasPension = false;

  for (const partition of Object.values(partitionsByAssetId)) {
    if (computeExcludedRebalanceBrl(partition) > 0) {
      hasNonInvestment = true;
      break;
    }
  }

  for (const position of positions) {
    const asset = assetById[position.asset_id];
    if (!asset || !isPensionAsset(asset)) {
      continue;
    }
    const currentBrl = resolvePositionCurrentBrlForDashboard(
      position,
      asset,
      null,
      partitionsByAssetId[position.asset_id],
      { includeNonInvestment: true, includePension: true }
    );
    if (currentBrl != null && currentBrl > 0) {
      hasPension = true;
      break;
    }
  }

  return { hasNonInvestment, hasPension };
}

export function sanitizeDashboardPatrimonyFilters(
  filters: DashboardPatrimonyFilters,
  availability: DashboardPatrimonyFilterAvailability
): DashboardPatrimonyFilters {
  return {
    includeNonInvestment: availability.hasNonInvestment ? filters.includeNonInvestment : false,
    includePension: availability.hasPension ? filters.includePension : false
  };
}

export function hasDashboardPatrimonyFilterOptions(
  availability: DashboardPatrimonyFilterAvailability
): boolean {
  return availability.hasNonInvestment || availability.hasPension;
}

function applyInvestedScope(
  investedBrl: number,
  currentBrl: number,
  scopedCurrentBrl: number
): number {
  if (investedBrl <= 0 || currentBrl <= 0) {
    return 0;
  }
  return investedBrl * (scopedCurrentBrl / currentBrl);
}

export function resolvePositionCurrentBrlForDashboard(
  position: Position,
  asset: Asset,
  usdBrlRate: number | null | undefined,
  partition: AssetPartition | undefined,
  filters: DashboardPatrimonyFilters = DEFAULT_DASHBOARD_PATRIMONY_FILTERS
): number | null {
  const current = positionCurrentValue(position, asset);
  if (current == null) {
    return null;
  }
  const currentBrl = valueInBrl(current, asset.currency, usdBrlRate);
  if (currentBrl == null) {
    return null;
  }

  if (isPensionAsset(asset)) {
    return filters.includePension ? currentBrl : 0;
  }

  return applyNonInvestmentScope(currentBrl, partition, filters);
}

export function resolvePositionInvestedBrlForDashboard(
  position: Position,
  asset: Asset,
  usdBrlRate: number | null | undefined,
  partition: AssetPartition | undefined,
  filters: DashboardPatrimonyFilters = DEFAULT_DASHBOARD_PATRIMONY_FILTERS
): number | null {
  const invested = positionInvestedValue(position, asset);
  if (invested == null) {
    return null;
  }
  const investedBrl = valueInBrl(invested, asset.currency, usdBrlRate);
  if (investedBrl == null) {
    return null;
  }

  const current = positionCurrentValue(position, asset);
  const currentBrl = current == null ? null : valueInBrl(current, asset.currency, usdBrlRate);
  if (currentBrl == null || currentBrl <= 0) {
    return null;
  }

  if (isPensionAsset(asset)) {
    return filters.includePension ? investedBrl : 0;
  }

  const scopedCurrentBrl = applyNonInvestmentScope(currentBrl, partition, filters);
  return applyInvestedScope(investedBrl, currentBrl, scopedCurrentBrl);
}
