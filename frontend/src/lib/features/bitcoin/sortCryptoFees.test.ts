import { describe, expect, it } from 'vitest';

import type { CryptoFee } from '$lib/api/cryptoFees';

import { sortCryptoFees } from './sortCryptoFees';

function fee(
  id: number,
  overrides: Partial<CryptoFee> = {}
): CryptoFee {
  return {
    id,
    portfolio_id: 1,
    asset_id: 1,
    fee_type: 'purchase',
    fee_date: '2025-06-01',
    quantity_moved: 1,
    fee_quantity_btc: 0.1,
    quote_brl: 100,
    fx_rate: 5,
    symbol: 'BTC-USD',
    asset_name: 'Bitcoin',
    final_quantity_after_fee: 0.9,
    fee_value_brl: 10,
    fee_value_usd: 2,
    fee_percent: 10,
    ...overrides
  };
}

describe('sortCryptoFees', () => {
  it('ordena por data decrescente por padrão', () => {
    const items = [
      fee(1, { fee_date: '2025-01-01' }),
      fee(2, { fee_date: '2025-06-01' }),
      fee(3, { fee_date: '2025-03-01' })
    ];
    const sorted = sortCryptoFees(items, 'fee_date', 'desc');
    expect(sorted.map((item) => item.id)).toEqual([2, 3, 1]);
  });

  it('ordena por quantidade movimentada ascendente', () => {
    const items = [
      fee(1, { quantity_moved: 0.002 }),
      fee(2, { quantity_moved: 0.001 }),
      fee(3, { quantity_moved: 0.003 })
    ];
    const sorted = sortCryptoFees(items, 'quantity_moved', 'asc');
    expect(sorted.map((item) => item.id)).toEqual([2, 1, 3]);
  });

  it('ordena por tipo', () => {
    const items = [
      fee(1, { fee_type: 'transfer' }),
      fee(2, { fee_type: 'purchase' })
    ];
    const sorted = sortCryptoFees(items, 'fee_type', 'asc');
    expect(sorted.map((item) => item.fee_type)).toEqual(['purchase', 'transfer']);
  });

  it('ordena por cotação em reais', () => {
    const items = [
      fee(1, { quote_brl: 500_000 }),
      fee(2, { quote_brl: 400_000 })
    ];
    const sorted = sortCryptoFees(items, 'quote_brl', 'asc');
    expect(sorted.map((item) => item.id)).toEqual([2, 1]);
  });

  it('ordena por cotação em dólares calculada', () => {
    const items = [
      fee(1, { quote_brl: 590_867, fx_rate: 5.54 }),
      fee(2, { quote_brl: 410_329, fx_rate: 5.15 })
    ];
    const sorted = sortCryptoFees(items, 'quote_usd', 'desc');
    expect(sorted.map((item) => item.id)).toEqual([1, 2]);
  });
});
