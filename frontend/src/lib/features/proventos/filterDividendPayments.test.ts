import { describe, expect, it } from 'vitest';

import type { DividendPayment } from '$lib/api/dividendPayments';

import { filterDividendPayments } from './filterDividendPayments';

const sample = (symbol: string, name: string): DividendPayment => ({
  id: 1,
  asset_id: 1,
  payment_type: 'dividend',
  payment_date: '2024-01-01',
  amount: 10,
  currency: 'BRL',
  symbol,
  asset_name: name,
  market: 'national',
  display_class: 'stocks'
});

describe('filterDividendPayments', () => {
  it('returns all when query is empty', () => {
    const items = [sample('BBSE3', 'BB Seguridade'), sample('PETR4', 'Petrobras')];
    expect(filterDividendPayments(items, '')).toHaveLength(2);
  });

  it('filters by ticker', () => {
    const items = [sample('BBSE3', 'BB Seguridade'), sample('PETR4', 'Petrobras')];
    expect(filterDividendPayments(items, 'BBSE')).toHaveLength(1);
    expect(filterDividendPayments(items, 'BBSE')[0].symbol).toBe('BBSE3');
  });

  it('filters by asset name', () => {
    const items = [sample('BBSE3', 'BB Seguridade'), sample('PETR4', 'Petrobras')];
    expect(filterDividendPayments(items, 'petro')).toHaveLength(1);
  });
});
