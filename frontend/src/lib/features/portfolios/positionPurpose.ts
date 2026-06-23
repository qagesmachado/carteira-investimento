import type { AssetPartition } from '$lib/api/objetivos';

export type SlicePurposeRow = {
  objectiveId: number;
  objectiveName: string;
  sliceName: string;
  currentValueBrl: number;
  excludeFromRebalance: boolean;
  isEmergencyReserve: boolean;
};

export function findAssetPartition(
  partitions: AssetPartition[],
  assetId: number
): AssetPartition | undefined {
  return partitions.find((partition) => partition.asset_id === assetId);
}

export function buildPurposeRows(partition: AssetPartition | undefined): SlicePurposeRow[] {
  if (!partition) {
    return [];
  }
  return partition.slices
    .filter((slice) => !slice.is_default)
    .map((slice) => ({
      objectiveId: slice.objective_id,
      objectiveName: slice.objective_name,
      sliceName: slice.slice_name,
      currentValueBrl: slice.current_value_brl ?? 0,
      excludeFromRebalance: slice.exclude_from_rebalance,
      isEmergencyReserve: slice.is_emergency_reserve
    }))
    .sort((a, b) => a.sliceName.localeCompare(b.sliceName, 'pt-BR'));
}

export function computeExcludedRebalanceBrl(partition: AssetPartition | undefined): number {
  if (!partition) {
    return 0;
  }
  return partition.slices
    .filter((slice) => !slice.is_default && slice.exclude_from_rebalance)
    .reduce((sum, slice) => sum + (slice.current_value_brl ?? 0), 0);
}

export function computeInvestmentValueBrl(
  totalBrl: number | null | undefined,
  excludedBrl: number
): number | null {
  if (totalBrl == null) {
    return null;
  }
  return Math.max(0, totalBrl - excludedBrl);
}

export function hasPurposeBreakdown(partition: AssetPartition | undefined): boolean {
  if (!partition) {
    return false;
  }
  return partition.slices.some((slice) => !slice.is_default);
}
