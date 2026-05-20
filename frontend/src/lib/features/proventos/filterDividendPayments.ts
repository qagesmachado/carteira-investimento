import type { DividendPayment } from '$lib/api/dividendPayments';
import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

export function filterDividendPayments(
  payments: DividendPayment[],
  query: string
): DividendPayment[] {
  const q = query.trim();
  if (!q) {
    return payments;
  }

  const qLower = q.toLowerCase();
  const qUpper = q.toUpperCase();

  return payments.filter((payment) => {
    const displayTicker = formatTickerForDisplay(payment.symbol);
    const symbolUpper = payment.symbol.toUpperCase();
    if (
      displayTicker.includes(qUpper) ||
      symbolUpper.includes(qUpper) ||
      symbolUpper.replace('.SA', '').includes(qUpper)
    ) {
      return true;
    }
    return payment.asset_name.toLowerCase().includes(qLower);
  });
}
