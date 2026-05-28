import type { DividendPayment } from '$lib/api/dividendPayments';

/**
 * Filtra proventos por carteira no client.
 *
 * - `portfolio_id` undefined: retorna a lista inteira (default "todas as carteiras").
 * - `portfolio_id` numero: retorna apenas proventos daquela carteira.
 *
 * Existe para complementar o filtro do servidor; tambem permite filtrar
 * uma colecao ja em memoria (ex.: na visao consolidada apos cache local).
 */
export function filterDividendPaymentsByPortfolio(
  payments: DividendPayment[],
  portfolioId: number | undefined
): DividendPayment[] {
  if (portfolioId == null) {
    return payments;
  }
  return payments.filter((p) => p.portfolio_id === portfolioId);
}
