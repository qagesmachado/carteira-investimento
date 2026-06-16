import { HIDDEN_SCORE_MASK, isMoneyHidden } from '$lib/moneyDisplay';

export function viabilityBadgeClass(color?: string | null): string {
  if (isMoneyHidden()) {
    return 'badge-ghost';
  }
  switch (color) {
    case 'azulim':
      return 'bg-info/15 text-info border-info/30';
    case 'viavel':
      return 'bg-success/15 text-success border-success/30';
    case 'atencao':
      return 'bg-warning/15 text-warning border-warning/30';
    case 'bomba':
      return 'bg-error/15 text-error border-error/30';
    case 'success':
      return 'badge-success';
    case 'warning':
      return 'badge-warning';
    case 'error':
      return 'badge-error';
    case 'info':
      return 'badge-info';
    default:
      return 'badge-ghost';
  }
}

export function formatBlockScore(score: number | null | undefined): string {
  if (score == null) return '—';
  return Number.isInteger(score) ? String(score) : score.toFixed(2);
}

export function formatDiagramScore(score: number | null | undefined): string {
  if (score == null) return '—';
  const prefix = score > 0 ? '+' : '';
  return `${prefix}${formatBlockScore(score)}`;
}

export function formatDiagramScoreForDisplay(score: number | null | undefined): string {
  if (score == null) return '—';
  if (isMoneyHidden()) {
    return HIDDEN_SCORE_MASK;
  }
  return formatDiagramScore(score);
}

export function formatTableSumForDisplay(total: number | null | undefined): string {
  if (total == null) return '—';
  if (isMoneyHidden()) {
    return HIDDEN_SCORE_MASK;
  }
  return Number.isInteger(total) ? String(total) : total.toFixed(2);
}

export function formatViabilityLabelForDisplay(label: string | null | undefined): string {
  if (!label?.trim()) return '—';
  if (isMoneyHidden()) {
    return HIDDEN_SCORE_MASK;
  }
  return label;
}
