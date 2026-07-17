export function computePercentDeviation(
  currentPercent: number,
  targetPercent: number
): number {
  return currentPercent - targetPercent;
}

export function computeValueDeviationBrl(
  currentValueBrl: number,
  targetValueBrl: number
): number {
  return currentValueBrl - targetValueBrl;
}

export function formatSignedPercent(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  if (Math.abs(value) < 0.0005) {
    return '0,00%';
  }
  const sign = value > 0 ? '+' : '−';
  const abs = Math.abs(value);
  return `${sign}${abs.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  })}%`;
}

export function formatSignedBrl(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value)) {
    return '—';
  }
  if (Math.abs(value) < 0.005) {
    return 'R$ 0,00';
  }
  const sign = value > 0 ? '+' : '−';
  const abs = Math.abs(value);
  const formatted = abs.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  return `${sign}${formatted.replace(/^R\$\s?/, 'R$ ')}`;
}

export function deviationTone(value: number | null | undefined): string {
  if (value == null || !Number.isFinite(value) || Math.abs(value) < 0.0005) {
    return '';
  }
  return value > 0 ? 'text-success' : 'text-error';
}

export const DEVIATION_THRESHOLD_PERCENT = 0.05;

export function countClassesAboveTarget(
  classes: { current_percent: number; target_percent: number }[]
): number {
  return classes.filter(
    (row) => row.current_percent - row.target_percent > DEVIATION_THRESHOLD_PERCENT
  ).length;
}

export function countClassesBelowTarget(
  classes: { current_percent: number; target_percent: number }[]
): number {
  return classes.filter(
    (row) => row.target_percent - row.current_percent > DEVIATION_THRESHOLD_PERCENT
  ).length;
}
