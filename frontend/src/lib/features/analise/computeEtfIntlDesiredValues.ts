export type EtfIntlAllocationDraft = {
  asset_id: number;
  target_percent: number;
  analysis_link: string;
};

export function sumTargetPercents(
  allocations: EtfIntlAllocationDraft[],
  excludeAssetIds: ReadonlySet<number> = new Set()
): number {
  return allocations.reduce((sum, row) => {
    if (excludeAssetIds.has(row.asset_id)) {
      return sum;
    }
    return sum + (row.target_percent || 0);
  }, 0);
}

export function isAllocationSumValid(
  allocations: EtfIntlAllocationDraft[],
  tolerance = 0.01,
  excludeAssetIds: ReadonlySet<number> = new Set()
): boolean {
  const active = allocations.filter((row) => !excludeAssetIds.has(row.asset_id));
  if (active.length === 0) {
    return false;
  }
  return Math.abs(sumTargetPercents(allocations, excludeAssetIds) - 100) <= tolerance;
}

export function computeCurrentPercentInGroup(
  currentValueBrl: number,
  groupTotalBrl: number
): number | null {
  if (groupTotalBrl <= 0) {
    return null;
  }
  return (currentValueBrl / groupTotalBrl) * 100;
}

export function computeDesiredValueBrl(
  patrimonyBrl: number,
  classTargetPercent: number,
  targetPercentInGroup: number
): number | null {
  if (patrimonyBrl <= 0 || targetPercentInGroup <= 0) {
    return null;
  }
  const portfolioTarget = (targetPercentInGroup * classTargetPercent) / 100;
  return (patrimonyBrl * portfolioTarget) / 100;
}

export function computeDesiredValueUsd(
  valueBrl: number | null,
  usdBrlRate: number | null | undefined
): number | null {
  if (valueBrl == null || !usdBrlRate || usdBrlRate <= 0) {
    return null;
  }
  return valueBrl / usdBrlRate;
}

export function parseTargetPercentRef(value: string | null | undefined): number {
  if (!value?.trim()) {
    return 0;
  }
  const parsed = Number.parseFloat(value.replace(',', '.'));
  return Number.isFinite(parsed) ? parsed : 0;
}

export function allocationTargetPercentFromRow(row: {
  is_pending?: boolean;
  score_refs?: { target_percent?: string | null };
}): number {
  if (row.is_pending) {
    return 0;
  }
  return parseTargetPercentRef(row.score_refs?.target_percent);
}

export function buildAllocationSavePayload(
  drafts: EtfIntlAllocationDraft[],
  pendingAssetIds: ReadonlySet<number>
): EtfIntlAllocationDraft[] {
  return drafts.map((draft) => ({
    ...draft,
    target_percent: pendingAssetIds.has(draft.asset_id) ? 0 : draft.target_percent
  }));
}
