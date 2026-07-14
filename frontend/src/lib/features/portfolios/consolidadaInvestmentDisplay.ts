/** Fração investível de uma posição (0–1) quando parcelas «não investimento» estão fora do escopo. */
export function computeInvestmentShare(
  includeNonInvestment: boolean,
  currentBrl: number | null,
  investmentCurrentBrl: number | null
): number {
  if (includeNonInvestment) {
    return 1;
  }
  if (investmentCurrentBrl == null || investmentCurrentBrl <= 0) {
    return 0;
  }
  if (currentBrl == null || currentBrl <= 0) {
    return 1;
  }
  return Math.max(0, Math.min(1, investmentCurrentBrl / currentBrl));
}

export function scalePositionAmount(amount: number | null, share: number): number | null {
  if (amount == null) {
    return null;
  }
  return amount * share;
}
