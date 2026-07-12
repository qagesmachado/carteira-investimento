import type { ClassRebalanceRow } from '$lib/api/rebalance';

export const MAX_BELOW_TARGET_ITEMS = 3;
const BELOW_TARGET_GAP_THRESHOLD = 0.05;

export type RebalanceBelowTargetItem = {
  classLabel: string;
  gapPercent: number;
};

export type RebalanceAdherenceInsight = {
  adherencePercent: number;
  belowTargetItems: RebalanceBelowTargetItem[];
  statusMessage: string | null;
  hasTargets: boolean;
};

function meanAbsoluteDeviation(classes: ClassRebalanceRow[]): number {
  if (classes.length === 0) {
    return 0;
  }
  const total = classes.reduce(
    (sum, row) => sum + Math.abs(row.current_percent - row.target_percent),
    0
  );
  return total / classes.length;
}

export function formatGapBelowTarget(gapPercent: number): string {
  return `${gapPercent.toLocaleString('pt-BR', {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  })}%`;
}

export function formatBelowTargetLine(item: RebalanceBelowTargetItem): string {
  return `${item.classLabel} ${formatGapBelowTarget(item.gapPercent)} abaixo da meta`;
}

export function computeRebalanceAdherence(classes: ClassRebalanceRow[]): RebalanceAdherenceInsight {
  if (classes.length === 0) {
    return {
      adherencePercent: 0,
      belowTargetItems: [],
      statusMessage: 'Configure metas em Rebalanceamento para acompanhar a aderência.',
      hasTargets: false
    };
  }

  const targetSum = classes.reduce((sum, row) => sum + row.target_percent, 0);
  const hasTargets = targetSum > 0.01;

  const deviation = meanAbsoluteDeviation(classes);
  const adherencePercent = Math.max(0, Math.min(100, Math.round(100 - deviation)));

  const belowTargetItems = classes
    .map((row) => ({
      classLabel: row.label,
      gapPercent: row.target_percent - row.current_percent
    }))
    .filter((item) => item.gapPercent > BELOW_TARGET_GAP_THRESHOLD)
    .sort((a, b) => b.gapPercent - a.gapPercent)
    .slice(0, MAX_BELOW_TARGET_ITEMS);

  if (belowTargetItems.length > 0) {
    return {
      adherencePercent,
      belowTargetItems,
      statusMessage: null,
      hasTargets
    };
  }

  return {
    adherencePercent,
    belowTargetItems: [],
    statusMessage: 'Carteira aderente às metas',
    hasTargets
  };
}
