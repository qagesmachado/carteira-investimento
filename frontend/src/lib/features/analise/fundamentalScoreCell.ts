export function fundamentalScoreColorClass(value: number | null | undefined): string {
  switch (value) {
    case 5:
      return 'bg-green-500 text-white';
    case 3:
      return 'bg-amber-400 text-amber-950';
    case 2:
      return 'bg-red-500 text-white';
    case 1:
      return 'bg-gray-400 text-white';
    default:
      return 'bg-base-300 text-base-content/70';
  }
}

export function formatFundamentalScoreValue(value: number | null | undefined): string {
  if (value == null) return '—';
  return String(value);
}
