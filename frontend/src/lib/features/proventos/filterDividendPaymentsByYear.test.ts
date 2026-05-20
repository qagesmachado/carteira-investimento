import { describe, expect, it } from 'vitest';

import type { DividendPayment } from '$lib/api/dividendPayments';

import { filterDividendPaymentsByYear } from './filterDividendPaymentsByYear';

const payment = (date: string): DividendPayment => ({
  id: 1,
  asset_id: 1,
  payment_type: 'dividend',
  payment_date: date,
  amount: 10,
  currency: 'BRL',
  symbol: 'ITSA4',
  asset_name: 'Itaúsa',
  market: 'national',
  display_class: 'stocks'
});

describe('filterDividendPaymentsByYear', () => {
  it('returns all when year is empty', () => {
    const items = [payment('2024-05-01'), payment('2025-01-02')];
    expect(filterDividendPaymentsByYear(items, '')).toHaveLength(2);
  });

  it('filters by payment year', () => {
    const items = [payment('2024-05-01'), payment('2025-01-02'), payment('2025-12-31')];
    expect(filterDividendPaymentsByYear(items, '2025')).toHaveLength(2);
    expect(filterDividendPaymentsByYear(items, '2024')).toHaveLength(1);
  });
});
