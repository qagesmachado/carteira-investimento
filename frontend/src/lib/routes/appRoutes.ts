/** Rota da visão consolidada (menu principal, fora de `/portfolios`). */
export const CONSOLIDADA_PATH = '/consolidada';

export function consolidadaHref(displayClass?: string): string {
  if (!displayClass) return CONSOLIDADA_PATH;
  return `${CONSOLIDADA_PATH}?display_class=${encodeURIComponent(displayClass)}`;
}
