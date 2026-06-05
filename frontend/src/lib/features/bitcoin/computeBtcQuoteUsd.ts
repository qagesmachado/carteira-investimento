/** Cotação BTC em US$ a partir da cotação em R$ e do fator R$/US$. */
export function computeBtcQuoteUsd(quoteBrl: number, fxRate: number): number {
  if (!Number.isFinite(quoteBrl) || !Number.isFinite(fxRate) || fxRate <= 0) {
    return NaN;
  }
  return quoteBrl / fxRate;
}
