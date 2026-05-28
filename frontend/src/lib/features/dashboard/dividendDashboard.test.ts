import { describe, expect, it } from 'vitest';

import type { DividendPayment } from '$lib/api/dividendPayments';

import {
  aggregateDividendsByDisplayClass,
  aggregateDividendsByMonth,
  aggregateDividendsByYear,
  computeDividendBarRows,
  dividendRowAmountBrl,
  filterPaymentsInRange,
  getDividendPanelTitle,
  getMonthBounds,
  getYearBounds,
  listPaymentYears,
  pickDefaultYear,
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

  it('listPaymentYears retorna anos ordenados', () => {
    const payments = [
      payment({ payment_date: '2021-03-01' }),
      payment({ id: 2, payment_date: '2020-08-10' }),
      payment({ id: 3, payment_date: '2026-01-05' })
    ];
    expect(listPaymentYears(payments)).toEqual([2020, 2021, 2026]);
  });

  it('pickDefaultYear prefere ano corrente quando existe', () => {
    expect(pickDefaultYear([2019, 2025, 2026], new Date(2025, 0, 1))).toBe(2025);
    expect(pickDefaultYear([2019, 2020], new Date(2025, 0, 1))).toBe(2020);
  });

  it('aggregateDividendsByYear agrupa totais por ano', () => {
    const payments = [
      payment({ payment_date: '2020-01-10', amount: 10 }),
      payment({ id: 2, payment_date: '2020-06-10', amount: 15 }),
      payment({ id: 3, payment_date: '2021-02-01', amount: 40 })
    ];
    const rows = aggregateDividendsByYear(payments);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ label: '2020', count: 2 });
    expect(rows[0].totalByCurrency.BRL).toBe(25);
    expect(rows[1]).toMatchObject({ label: '2021', count: 1 });
  });

  it('aggregateDividendsByMonth retorna 12 meses do ano', () => {
    const payments = [
      payment({ payment_date: '2021-02-10', amount: 20 }),
      payment({ id: 2, payment_date: '2021-08-05', amount: 30 })
    ];
    const rows = aggregateDividendsByMonth(payments, 2021);
    expect(rows).toHaveLength(12);
    expect(rows[0]).toMatchObject({ label: 'Jan', count: 0 });
    expect(rows[1]).toMatchObject({ label: 'Fev', count: 1 });
    expect(rows[1].totalByCurrency.BRL).toBe(20);
    expect(rows[7]).toMatchObject({ label: 'Ago', count: 1 });
    expect(rows[7].totalByCurrency.BRL).toBe(30);
  });

  it('getDividendPanelTitle descreve modo anual e mensal', () => {
    expect(getDividendPanelTitle('annual')).toBe('por ano');
    expect(getDividendPanelTitle('monthly', 2021)).toBe('mensais — 2021');
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

  it('dividendRowAmountBrl soma BRL e converte USD com taxa', () => {
    const row = {
      label: 'Internacional',
      totalByCurrency: { USD: 10 },
      count: 1
    };
    expect(dividendRowAmountBrl(row, 5)).toBe(50);
    expect(dividendRowAmountBrl(row, null)).toBe(10);
  });

  it('computeDividendBarRows normaliza largura pela maior classe', () => {
    const rows = aggregateDividendsByDisplayClass([
      payment({ display_class: 'stocks', amount: 50 }),
      payment({ id: 2, display_class: 'funds', amount: 25, symbol: 'HGLG11' })
    ]);
    const bars = computeDividendBarRows(rows, null);
    expect(bars).toHaveLength(2);
    expect(bars[0].barPercent).toBe(100);
    expect(bars[1].barPercent).toBe(50);
  });
});
