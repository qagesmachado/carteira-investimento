import { describe, expect, it } from 'vitest';

import type { DividendPayment } from '$lib/api/dividendPayments';

import { computeProventosKpis } from './proventosKpis';

function payment(overrides: Partial<DividendPayment>): DividendPayment {
  return {
    id: 1,
    asset_id: 1,
    portfolio_id: 1,
    payment_type: 'dividend',
    payment_date: '2026-05-10',
    amount: 100,
    currency: 'BRL',
    symbol: 'ITSA4',
    asset_name: 'Itausa',
    market: 'national',
    display_class: 'stocks',
    ...overrides
  };
}

const NOW = new Date('2026-05-15T12:00:00');

describe('computeProventosKpis', () => {
  it('soma total do ano e do mês corrente por moeda (histórico completo)', () => {
    const payments = [
      payment({ id: 1, payment_date: '2026-05-10', amount: 100 }),
      payment({ id: 2, payment_date: '2026-05-20', amount: 50 }),
      payment({ id: 3, payment_date: '2026-02-01', amount: 30 }),
      payment({ id: 4, payment_date: '2025-05-10', amount: 999 })
    ];

    const kpis = computeProventosKpis(payments, NOW);

    expect(kpis.year).toBe(2026);
    expect(kpis.month).toBe(5);
    expect(kpis.yearTotalByCurrency).toEqual({ BRL: 180 });
    expect(kpis.monthTotalByCurrency).toEqual({ BRL: 150 });
    expect(kpis.count).toBe(4);
  });

  it('separa totais por moeda', () => {
    const payments = [
      payment({ id: 1, payment_date: '2026-05-10', amount: 100, currency: 'BRL' }),
      payment({ id: 2, payment_date: '2026-05-11', amount: 20, currency: 'USD', symbol: 'VOO' })
    ];

    const kpis = computeProventosKpis(payments, NOW);

    expect(kpis.monthTotalByCurrency).toEqual({ BRL: 100, USD: 20 });
  });

  it('lida com lista vazia', () => {
    const kpis = computeProventosKpis([], NOW);

    expect(kpis.count).toBe(0);
    expect(kpis.yearTotalByCurrency).toEqual({});
    expect(kpis.monthTotalByCurrency).toEqual({});
  });
});
