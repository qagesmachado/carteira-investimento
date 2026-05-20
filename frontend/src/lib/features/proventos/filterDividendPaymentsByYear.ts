import type { DividendPayment } from '$lib/api/dividendPayments';

export function filterDividendPaymentsByYear(
  payments: DividendPayment[],
  year: string
): DividendPayment[] {
  const trimmed = year.trim();
  if (!trimmed) {
    return payments;
  }
  return payments.filter((payment) => payment.payment_date.startsWith(`${trimmed}-`));
}

export function collectPaymentYears(payments: DividendPayment[]): string[] {
  const years = new Set<string>();
  for (const payment of payments) {
    const year = payment.payment_date.slice(0, 4);
    if (/^\d{4}$/.test(year)) {
      years.add(year);
    }
  }
  return [...years].sort((a, b) => b.localeCompare(a, 'pt-BR'));
}
