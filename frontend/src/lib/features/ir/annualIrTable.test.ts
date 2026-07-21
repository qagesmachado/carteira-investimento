import { describe, expect, it } from 'vitest';

import type { AnnualIrPaymentRow, AnnualIrPositionRow } from '$lib/api/annualIrReport';

import {
  annualIrPositionInvestedAmount,
  excludeFixedIncomePositions,
  filterAnnualIrPayments,
  filterAnnualIrPositions,
  filterAnnualIrSummary,
  flattenAnnualIrSummary,
  sortAnnualIrPayments,
  sortAnnualIrPositions,
  sortAnnualIrSummaryRows
} from './annualIrTable';

const payment = (
  overrides: Partial<AnnualIrPaymentRow> = {}
): AnnualIrPaymentRow => ({
  symbol: 'BBSE3.SA',
  asset_name: 'BB Seguridade',
  asset_type: 'stock',
  display_class: 'stocks',
  market: 'national',
  payment_type: 'dividend',
  payment_date: '2024-03-10',
  amount: 100,
  currency: 'BRL',
  ...overrides
});

const position = (
  overrides: Partial<AnnualIrPositionRow> = {}
): AnnualIrPositionRow => ({
  symbol: 'BBSE3',
  asset_name: 'BB',
  asset_type: 'stock',
  display_class: 'stocks',
  market: 'national',
  quantity: 10,
  average_price: 20,
  currency: 'BRL',
  ...overrides
});

describe('annualIrTable', () => {
  it('filterAnnualIrPayments filtra por classe (mercado)', () => {
    const rows = [
      payment(),
      payment({ symbol: 'VOO', market: 'international', currency: 'USD' })
    ];
    expect(
      filterAnnualIrPayments(rows, { market: 'international' }).map((row) => row.symbol)
    ).toEqual(['VOO']);
    expect(
      filterAnnualIrPayments(rows, { market: 'national' }).map((row) => row.symbol)
    ).toEqual(['BBSE3.SA']);
  });

  it('filterAnnualIrPayments filtra por tipo de ativo e provento', () => {
    const rows = [
      payment(),
      payment({ symbol: 'HSML11', asset_type: 'fii', payment_type: 'dividend' }),
      payment({ payment_type: 'jcp' })
    ];
    expect(
      filterAnnualIrPayments(rows, { assetType: 'fii', paymentType: '' }).map((row) => row.symbol)
    ).toEqual(['HSML11']);
    expect(
      filterAnnualIrPayments(rows, { assetType: '', paymentType: 'jcp' }).map(
        (row) => row.payment_type
      )
    ).toEqual(['jcp']);
  });

  it('filterAnnualIrSummary filtra por classe (mercado)', () => {
    const rows = [
      {
        asset_id: 1,
        symbol: 'BBSE3',
        asset_name: 'BB',
        asset_type: 'stock' as const,
        display_class: 'stocks' as const,
        market: 'national' as const,
        totals_by_type: { dividend: 100 },
        total_by_currency: { BRL: 100 }
      },
      {
        asset_id: 2,
        symbol: 'VOO',
        asset_name: 'VOO',
        asset_type: 'etf' as const,
        display_class: 'international' as const,
        market: 'international' as const,
        totals_by_type: { dividend: 10 },
        total_by_currency: { USD: 10 }
      }
    ];
    expect(
      filterAnnualIrSummary(rows, { market: 'international' }).map((row) => row.symbol)
    ).toEqual(['VOO']);
  });

  it('filterAnnualIrPositions filtra por classe (mercado)', () => {
    const rows = [
      position(),
      position({ symbol: 'VOO', market: 'international', asset_type: 'etf' })
    ];
    expect(
      filterAnnualIrPositions(rows, { market: 'international' }).map((row) => row.symbol)
    ).toEqual(['VOO']);
  });

  it('excludeFixedIncomePositions remove renda fixa e previdência', () => {
    const positions: AnnualIrPositionRow[] = [
      position(),
      position({
        symbol: 'CDB',
        asset_name: 'CDB',
        asset_type: 'fixed_income',
        display_class: 'fixed_income'
      }),
      position({
        symbol: 'PREVIDENCIA',
        asset_name: 'Previdência BTG',
        asset_type: 'pension',
        display_class: 'pension'
      })
    ];
    expect(excludeFixedIncomePositions(positions)).toHaveLength(1);
    expect(excludeFixedIncomePositions(positions)[0].symbol).toBe('BBSE3');
  });

  it('sortAnnualIrPayments ordena por data', () => {
    const rows = [
      payment({ payment_date: '2024-09-01' }),
      payment({ payment_date: '2024-03-10' })
    ];
    const sorted = sortAnnualIrPayments(rows, 'payment_date', 'asc');
    expect(sorted.map((row) => row.payment_date)).toEqual(['2024-03-10', '2024-09-01']);
  });

  it('sortAnnualIrPayments ordena por classe (mercado)', () => {
    const rows = [
      payment({ symbol: 'VOO', market: 'international' }),
      payment({ market: 'national' })
    ];
    const sorted = sortAnnualIrPayments(rows, 'market', 'asc');
    expect(sorted.map((row) => row.market)).toEqual(['international', 'national']);
  });

  it('flattenAnnualIrSummary expande moedas', () => {
    const rows = flattenAnnualIrSummary([
      {
        asset_id: 1,
        symbol: 'VOO',
        asset_name: 'VOO',
        asset_type: 'etf',
        display_class: 'international',
        market: 'international',
        totals_by_type: { dividend: 10 },
        total_by_currency: { USD: 10 }
      }
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].currency).toBe('USD');
    expect(rows[0].total).toBe(10);
  });

  it('sortAnnualIrSummaryRows ordena por classe', () => {
    const flattened = flattenAnnualIrSummary([
      {
        asset_id: 1,
        symbol: 'BBSE3',
        asset_name: 'BB',
        asset_type: 'stock',
        display_class: 'stocks',
        market: 'national',
        totals_by_type: { dividend: 100 },
        total_by_currency: { BRL: 100 }
      },
      {
        asset_id: 2,
        symbol: 'VOO',
        asset_name: 'VOO',
        asset_type: 'etf',
        display_class: 'international',
        market: 'international',
        totals_by_type: { dividend: 10 },
        total_by_currency: { USD: 10 }
      }
    ]);
    const sorted = sortAnnualIrSummaryRows(flattened, 'market', 'asc');
    expect(sorted.map((row) => row.symbol)).toEqual(['VOO', 'BBSE3']);
  });

  it('annualIrPositionInvestedAmount multiplica quantidade por preço médio', () => {
    expect(annualIrPositionInvestedAmount(position({ quantity: 100, average_price: 32.5 }))).toBe(
      3250
    );
  });

  it('sortAnnualIrPositions ordena por quantidade', () => {
    const positions: AnnualIrPositionRow[] = [
      position({ symbol: 'A', quantity: 50 }),
      position({ symbol: 'B', quantity: 10 })
    ];
    const sorted = sortAnnualIrPositions(positions, 'quantity', 'desc');
    expect(sorted[0].symbol).toBe('A');
  });

  it('sortAnnualIrPositions ordena por classe', () => {
    const positions: AnnualIrPositionRow[] = [
      position({ symbol: 'BBSE3', market: 'national' }),
      position({ symbol: 'VOO', market: 'international' })
    ];
    const sorted = sortAnnualIrPositions(positions, 'market', 'asc');
    expect(sorted.map((row) => row.symbol)).toEqual(['VOO', 'BBSE3']);
  });
});
