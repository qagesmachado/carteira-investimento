import { describe, expect, it } from 'vitest';

import type { AnnualIrPaymentRow, AnnualIrPositionRow } from '$lib/api/annualIrReport';

import {
  annualIrPositionInvestedAmount,
  excludeFixedIncomePositions,
  filterAnnualIrPayments,
  flattenAnnualIrSummary,
  sortAnnualIrPayments,
  sortAnnualIrPositions
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

  it('excludeFixedIncomePositions remove renda fixa e previdência', () => {
    const positions: AnnualIrPositionRow[] = [
      {
        symbol: 'BBSE3',
        asset_name: 'BB',
        asset_type: 'stock',
        display_class: 'stocks',
        quantity: 10,
        average_price: 20,
        currency: 'BRL'
      },
      {
        symbol: 'CDB',
        asset_name: 'CDB',
        asset_type: 'fixed_income',
        display_class: 'fixed_income',
        quantity: 0,
        average_price: 0,
        currency: 'BRL'
      },
      {
        symbol: 'PREVIDENCIA',
        asset_name: 'Previdência BTG',
        asset_type: 'pension',
        display_class: 'pension',
        quantity: 0,
        average_price: 0,
        currency: 'BRL'
      }
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

  it('flattenAnnualIrSummary expande moedas', () => {
    const rows = flattenAnnualIrSummary([
      {
        asset_id: 1,
        symbol: 'VOO',
        asset_name: 'VOO',
        asset_type: 'etf',
        display_class: 'international',
        totals_by_type: { dividend: 10 },
        total_by_currency: { USD: 10 }
      }
    ]);
    expect(rows).toHaveLength(1);
    expect(rows[0].currency).toBe('USD');
    expect(rows[0].total).toBe(10);
  });

  it('annualIrPositionInvestedAmount multiplica quantidade por preço médio', () => {
    expect(
      annualIrPositionInvestedAmount({
        symbol: 'BBSE3',
        asset_name: 'BB',
        asset_type: 'stock',
        display_class: 'stocks',
        quantity: 100,
        average_price: 32.5,
        currency: 'BRL'
      })
    ).toBe(3250);
  });

  it('sortAnnualIrPositions ordena por quantidade', () => {
    const positions: AnnualIrPositionRow[] = [
      {
        symbol: 'A',
        asset_name: 'A',
        asset_type: 'stock',
        display_class: 'stocks',
        quantity: 50,
        average_price: 1,
        currency: 'BRL'
      },
      {
        symbol: 'B',
        asset_name: 'B',
        asset_type: 'stock',
        display_class: 'stocks',
        quantity: 10,
        average_price: 1,
        currency: 'BRL'
      }
    ];
    const sorted = sortAnnualIrPositions(positions, 'quantity', 'desc');
    expect(sorted[0].symbol).toBe('A');
  });
});
