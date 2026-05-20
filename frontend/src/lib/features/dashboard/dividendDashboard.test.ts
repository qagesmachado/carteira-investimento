import { describe, expect, it } from 'vitest';

import type { DividendPayment } from '$lib/api/dividendPayments';

import {
  aggregateDividendsByDisplayClass,
  filterPaymentsInRange,
  getMonthBounds,
  getYearBounds,
  topAssetsByDividendAmount
} from './dividendDashboard';

const payment = (overrides: Partial<DividendPayment>): DividendPayment => ({
  id: 1,
  asset_id: 1,
  payment_type: 'dividend',
  payment_date: '2025-06-15',
  amount: 100,
  currency: 'BRL',
  symbol: 'BBSE3',
  asset_name: 'BB',
  market: 'national',
  display_class: 'stocks',
  ...overrides
});

describe('dividendDashboard', () => {
  it('getMonthBounds retorna primeiro e ultimo dia do mes', () => {
    const ref = new Date(2025, 5, 20);
    expect(getMonthBounds(ref)).toEqual({ from: '2025-06-01', to: '2025-06-30' });
  });

  it('getYearBounds retorna ano civil', () => {
    const ref = new Date(2025, 5, 20);
    expect(getYearBounds(ref)).toEqual({ from: '2025-01-01', to: '2025-12-31' });
  });

  it('filterPaymentsInRange inclui limites', () => {
    const payments = [
      payment({ payment_date: '2025-01-01', amount: 1 }),
      payment({ payment_date: '2025-06-15', amount: 2 }),
      payment({ payment_date: '2025-12-31', amount: 3 })
    ];
    const filtered = filterPaymentsInRange(payments, '2025-06-01', '2025-06-30');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].amount).toBe(2);
  });

  it('aggregateDividendsByDisplayClass soma por classe e moeda', () => {
    const payments = [
      payment({ display_class: 'stocks', amount: 50 }),
      payment({ id: 2, display_class: 'funds', amount: 30, symbol: 'HGLG11' }),
      payment({
        id: 3,
        display_class: 'international',
        amount: 10,
        currency: 'USD',
        symbol: 'VOO'
      })
    ];
    const rows = aggregateDividendsByDisplayClass(payments);
    expect(rows.find((r) => r.displayClass === 'stocks')?.totalByCurrency.BRL).toBe(50);
    expect(rows.find((r) => r.displayClass === 'international')?.totalByCurrency.USD).toBe(10);
  });

  it('topAssetsByDividendAmount respeita assetIds da carteira', () => {
    const payments = [
      payment({ asset_id: 1, amount: 50, symbol: 'A' }),
      payment({ id: 2, asset_id: 2, amount: 200, symbol: 'B' }),
      payment({ id: 3, asset_id: 3, amount: 999, symbol: 'OUT' })
    ];
    const top = topAssetsByDividendAmount(payments, new Set([1, 2]), {}, 5);
    expect(top).toHaveLength(2);
    expect(top[0].symbol).toBe('B');
    expect(top[0].amountBrl).toBe(200);
  });
});
