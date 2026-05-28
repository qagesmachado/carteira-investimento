import type { AssetDivergence, Objective } from '$lib/api/objetivos';

function rowValue(row: Objective['allocations'][number]): number {
  if (row.split_mode === 'amount') {
    return row.amount ?? 0;
  }
  return row.quantity ?? 0;
}

export function sumAllocatedInObjective(objective: Objective, assetId: number): number {
  return objective.allocations
    .filter((row) => row.asset_id === assetId)
    .reduce((sum, row) => sum + rowValue(row), 0);
}

export function canAddMoreSlices(
  objective: Objective,
  divergences: AssetDivergence[]
): boolean {
  if (objective.is_default) {
    return false;
  }
  if (objective.mode === 'multi_asset') {
    return true;
  }
  const assetId = objective.partition_asset_id;
  if (assetId == null) {
    return true;
  }
  const divergence = divergences.find((d) => d.asset_id === assetId);
  if (!divergence) {
    return true;
  }
  const used = sumAllocatedInObjective(objective, assetId);
  return used < divergence.total - 1e-9;
}

export function allocatedInObjectiveExcluding(
  objective: Objective,
  assetId: number,
  excludeAllocationId: number | null
): number {
  return objective.allocations
    .filter((row) => row.asset_id === assetId && row.id !== excludeAllocationId)
    .reduce((sum, row) => sum + rowValue(row), 0);
}

/**
 * Cotas/valor já alocados fora do rascunho atual.
 * - Nova fatia: tudo que já está explícito no ativo.
 * - Edição: explícito global menos o valor antigo da linha editada.
 */
export function explicitOthersForDraft(
  divergences: AssetDivergence[],
  objective: Objective,
  assetId: number,
  editingAllocationId: number | null
): number {
  const allocatedExplicit =
    divergences.find((d) => d.asset_id === assetId)?.allocated_explicit ?? 0;

  if (editingAllocationId == null) {
    return allocatedExplicit;
  }

  const editingRow = objective.allocations.find((row) => row.id === editingAllocationId);
  const oldValue = editingRow ? rowValue(editingRow) : 0;
  return Math.max(0, allocatedExplicit - oldValue);
}
