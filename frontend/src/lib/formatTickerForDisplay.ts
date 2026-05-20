/** Remove sufixo Yahoo B3 (`.SA`) para exibição na UI; tickers locais costumam sem sufixo. */
export function formatTickerForDisplay(symbol: string): string {
  const trimmed = symbol.trim();
  if (!trimmed) {
    return trimmed;
  }
  const upper = trimmed.toUpperCase();
  if (upper.endsWith('.SA')) {
    return upper.slice(0, -3);
  }
  return upper;
}
