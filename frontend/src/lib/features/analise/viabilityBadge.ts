export function viabilityBadgeClass(color?: string | null): string {
  switch (color) {
    case 'azulim':
      return 'bg-sky-100 text-sky-900 border-sky-200';
    case 'viavel':
      return 'bg-green-100 text-green-900 border-green-200';
    case 'atencao':
      return 'bg-amber-100 text-amber-900 border-amber-200';
    case 'bomba':
      return 'bg-red-100 text-red-900 border-red-200';
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
