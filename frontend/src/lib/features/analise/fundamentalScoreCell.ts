import { HIDDEN_SCORE_MASK, isMoneyHidden } from '$lib/moneyDisplay';

export function fundamentalScoreColorClass(value: number | null | undefined): string {
  if (isMoneyHidden()) {
    return 'bg-base-300 text-base-content/70';
  }
  switch (value) {
    case 5:
      return 'bg-success text-success-content';
    case 3:
      return 'bg-warning text-warning-content';
    case 2:
      return 'bg-error text-error-content';
    case 1:
      return 'bg-neutral text-neutral-content';
    default:
      return 'bg-base-300 text-base-content/70';
  }
}

export function formatFundamentalScoreValue(value: number | null | undefined): string {
  if (value == null) return '—';
  if (isMoneyHidden()) {
    return HIDDEN_SCORE_MASK;
  }
  return String(value);
}
