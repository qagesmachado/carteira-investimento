export type ClassRowForProjection = {
  current_value_brl: number;
  target_percent: number;
};

/** Quanto falta na classe para atingir a meta % sobre um patrimônio final informado. */
export function computeProjectedClassGap(
  currentValueBrl: number,
  targetPercent: number,
  targetPatrimonyBrl: number | null | undefined
): number | null {
  if (targetPatrimonyBrl == null || !Number.isFinite(targetPatrimonyBrl) || targetPatrimonyBrl <= 0) {
    return null;
  }
  const targetValue = (targetPatrimonyBrl * targetPercent) / 100;
  return Math.max(0, Math.round((targetValue - currentValueBrl) * 100) / 100);
}

/** Quanto falta no ativo para atingir o valor desejável com patrimônio final informado. */
export function computeProjectedAssetGap(
  currentValueBrl: number,
  targetValueBrl: number | null | undefined,
  currentPatrimonyBrl: number | null | undefined,
  targetPatrimonyBrl: number | null | undefined
): number | null {
  if (
    targetValueBrl == null ||
    currentPatrimonyBrl == null ||
    targetPatrimonyBrl == null ||
    !Number.isFinite(targetPatrimonyBrl) ||
    targetPatrimonyBrl <= 0 ||
    !Number.isFinite(currentPatrimonyBrl) ||
    currentPatrimonyBrl <= 0
  ) {
    return null;
  }
  const scaledTarget = targetValueBrl * (targetPatrimonyBrl / currentPatrimonyBrl);
  return Math.max(0, Math.round((scaledTarget - currentValueBrl) * 100) / 100);
}

export function computeProjectedTotalGap(
  classes: ClassRowForProjection[],
  targetPatrimonyBrl: number | null | undefined
): number | null {
  if (targetPatrimonyBrl == null || !Number.isFinite(targetPatrimonyBrl) || targetPatrimonyBrl <= 0) {
    return null;
  }
  let total = 0;
  for (const row of classes) {
    const gap = computeProjectedClassGap(
      row.current_value_brl,
      row.target_percent,
      targetPatrimonyBrl
    );
    if (gap != null) {
      total += gap;
    }
  }
  return Math.round(total * 100) / 100;
}
