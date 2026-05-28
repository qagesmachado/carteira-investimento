import { describe, expect, it } from 'vitest';

import type { DividendPayment } from '$lib/api/dividendPayments';

import { filterDividendPaymentsByPortfolio } from './filterDividendPaymentsByPortfolio';

function payment(id: number, portfolio_id: number | null): DividendPayment {
  return {
    id,
    asset_id: 1,
    portfolio_id,
    payment_type: 'dividend',
    payment_date: '2024-05-10',
    amount: 10,
    currency: 'BRL',
    symbol: 'BBSE3',
    asset_name: 'BB Seguridade',
    market: 'national',
    display_class: 'stocks'
  };
}

describe('filterDividendPaymentsByPortfolio', () => {
  it('retorna a lista inteira quando portfolioId for undefined', () => {
    const payments = [payment(1, 10), payment(2, 20), payment(3, null)];
    expect(filterDividendPaymentsByPortfolio(payments, undefined)).toEqual(payments);
  });

  it('filtra apenas proventos da carteira escolhida', () => {
    const payments = [payment(1, 10), payment(2, 20), payment(3, 10), payment(4, null)];
    const result = filterDividendPaymentsByPortfolio(payments, 10);
    expect(result.map((p) => p.id)).toEqual([1, 3]);
  });

  it('retorna vazio quando nenhum provento pertence a carteira escolhida', () => {
    const payments = [payment(1, 10), payment(2, null)];
    expect(filterDividendPaymentsByPortfolio(payments, 99)).toEqual([]);
  });

  it('nao retorna orfaos (portfolio_id null) quando filtrando por carteira especifica', () => {
    const payments = [payment(1, null), payment(2, 10)];
    const result = filterDividendPaymentsByPortfolio(payments, 10);
    expect(result.map((p) => p.id)).toEqual([2]);
  });
});
