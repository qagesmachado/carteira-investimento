/** Converte valor em BRL para USD usando câmbio USD/BRL. */
export function brlToUsd(
  brlValue: number | null | undefined,
  usdBrlRate: number | null | undefined
): number | null {
  if (brlValue == null || !Number.isFinite(brlValue)) {
    return null;
  }
  if (usdBrlRate == null || !Number.isFinite(usdBrlRate) || usdBrlRate <= 0) {
    return null;
  }
  return brlValue / usdBrlRate;
}
