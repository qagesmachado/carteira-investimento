import type { DividendPayment } from '$lib/api/dividendPayments';

export type CurrencyTotals = Record<string, number>;

export type ProventosKpis = {
  year: number;
  month: number;
  yearTotalByCurrency: CurrencyTotals;
  monthTotalByCurrency: CurrencyTotals;
  count: number;
};

function normalizeCurrency(currency: string | null | undefined): string {
  return currency?.trim().toUpperCase() || 'BRL';
}

/** Ano/mês a partir de uma data ISO (`YYYY-MM-DD`), sem depender de timezone. */
function parseIsoYearMonth(iso: string): { year: number; month: number } | null {
  const [y, m] = iso.split('-');
  const year = Number(y);
  const month = Number(m);
  if (!Number.isInteger(year) || !Number.isInteger(month) || month < 1 || month > 12) {
    return null;
  }
  return { year, month };
}

function addToTotals(totals: CurrencyTotals, currency: string, amount: number): void {
  totals[currency] = (totals[currency] ?? 0) + amount;
}

/**
 * KPIs de proventos sobre o **histórico completo** do escopo (carteira ativa):
 * total no ano, total no mês corrente e número de lançamentos.
 *
 * O destaque "Maior pagador" e o ranking "Top ativos" NÃO ficam aqui: eles usam
 * apenas ativos em carteira (ver `topAssetsByDividendAmount` no dashboard).
 */
export function computeProventosKpis(
  payments: DividendPayment[],
  now: Date = new Date()
): ProventosKpis {
  const year = now.getFullYear();
  const month = now.getMonth() + 1;

  const yearTotalByCurrency: CurrencyTotals = {};
  const monthTotalByCurrency: CurrencyTotals = {};

  for (const payment of payments) {
    const currency = normalizeCurrency(payment.currency);
    const parsed = parseIsoYearMonth(payment.payment_date);

    if (parsed && parsed.year === year) {
      addToTotals(yearTotalByCurrency, currency, payment.amount);
      if (parsed.month === month) {
        addToTotals(monthTotalByCurrency, currency, payment.amount);
      }
    }
  }

  return {
    year,
    month,
    yearTotalByCurrency,
    monthTotalByCurrency,
    count: payments.length
  };
}
