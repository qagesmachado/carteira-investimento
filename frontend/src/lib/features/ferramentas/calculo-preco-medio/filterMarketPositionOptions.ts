import type { MarketPositionOption } from './filterMarketPositions';

export function filterMarketPositionOptions(
  options: MarketPositionOption[],
  query: string
): MarketPositionOption[] {
  const q = query.trim();
  if (!q) {
    return options;
  }

  const qLower = q.toLowerCase();
  const qUpper = q.toUpperCase();

  return options.filter((option) => {
    const labelUpper = option.label.toUpperCase();
    return labelUpper.includes(qUpper) || option.label.toLowerCase().includes(qLower);
  });
}
