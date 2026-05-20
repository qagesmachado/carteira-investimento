import { describe, expect, it } from 'vitest';

import type { DividendPayment } from '$lib/api/dividendPayments';

import { sortDividendPayments } from './sortDividendPayments';

const payment = (
  symbol: string,
  date: string,
  amount: number,
  type: DividendPayment['payment_type'] = 'dividend'
): DividendPayment => ({
  id: 1,
  asset_id: 1,
  payment_type: type,
  payment_date: date,
  amount,
  currency: 'BRL',
  symbol,
  asset_name: symbol,
  market: 'national',
  display_class: 'stocks'
});

describe('sortDividendPayments', () => {
  it('sorts by amount ascending', () => {
    const items = [
      payment('B', '2024-02-01', 50),
      payment('A', '2024-01-01', 10)
    ];
    const sorted = sortDividendPayments(items, 'amount', 'asc');
    expect(sorted.map((p) => p.amount)).toEqual([10, 50]);
  });

  it('sorts by payment_date descending', () => {
    const items = [
      payment('A', '2024-01-01', 10),
      payment('B', '2024-06-01', 20)
    ];
    const sorted = sortDividendPayments(items, 'payment_date', 'desc');
    expect(sorted[0].payment_date).toBe('2024-06-01');
  });
});
