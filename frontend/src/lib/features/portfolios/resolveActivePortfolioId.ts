import type { Portfolio } from '$lib/api/portfolios';

/** Resolve a carteira ativa global, validando se ainda existe na lista. */
export function resolveActivePortfolioId(
  storedActiveId: number | null,
  portfolios: Portfolio[]
): number | null {
  if (
    storedActiveId != null &&
    portfolios.some((portfolio) => portfolio.id === storedActiveId)
  ) {
    return storedActiveId;
  }
  return portfolios[0]?.id ?? null;
}
