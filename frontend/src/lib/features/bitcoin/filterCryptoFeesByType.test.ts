import { describe, expect, it } from 'vitest';

import type { CryptoFee } from '$lib/api/cryptoFees';

import { filterCryptoFeesByType } from './filterCryptoFeesByType';

function fee(id: number, type: CryptoFee['fee_type']): CryptoFee {
  return {
    id,
    portfolio_id: 1,
    asset_id: 1,
    fee_type: type,
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
    fee_percent: 10
  };
}

describe('filterCryptoFeesByType', () => {
  const items = [fee(1, 'purchase'), fee(2, 'transfer'), fee(3, 'purchase')];

  it('retorna todos quando filtro vazio', () => {
    expect(filterCryptoFeesByType(items, '')).toHaveLength(3);
  });

  it('filtra por tipo purchase', () => {
    const filtered = filterCryptoFeesByType(items, 'purchase');
    expect(filtered).toHaveLength(2);
    expect(filtered.every((item) => item.fee_type === 'purchase')).toBe(true);
  });

  it('filtra por tipo transfer', () => {
    const filtered = filterCryptoFeesByType(items, 'transfer');
    expect(filtered).toHaveLength(1);
    expect(filtered[0].id).toBe(2);
  });
});
