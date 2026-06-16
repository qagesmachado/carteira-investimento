/** Arredonda valor monetário para 2 casas — evita artefatos de float no Excel/CSV. */
export function roundMoneyForExport(value: number): number {
  if (!Number.isFinite(value)) {
    return 0;
  }
  return Math.round(value * 100) / 100;
}
