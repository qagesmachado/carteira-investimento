import type { DividendPayment } from '$lib/api/dividendPayments';

export type DividendPaymentSortKey =
  | 'payment_date'
  | 'symbol'
  | 'payment_type'
  | 'amount'
  | 'market';

export type SortDirection = 'asc' | 'desc';

export function sortDividendPayments(
  payments: DividendPayment[],
  key: DividendPaymentSortKey,
  direction: SortDirection
): DividendPayment[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...payments].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'payment_date':
        cmp = a.payment_date.localeCompare(b.payment_date);
        break;
      case 'symbol':
        cmp = a.symbol.localeCompare(b.symbol, 'pt-BR');
        break;
      case 'payment_type':
        cmp = a.payment_type.localeCompare(b.payment_type);
        break;
      case 'amount':
        cmp = a.amount - b.amount;
        break;
      case 'market':
        cmp = a.market.localeCompare(b.market);
        break;
      default:
        cmp = 0;
    }
    if (cmp === 0 && key !== 'payment_date') {
      cmp = b.payment_date.localeCompare(a.payment_date);
    }
    return cmp * factor;
  });
}

export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}
