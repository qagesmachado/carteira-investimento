import { describe, expect, it } from 'vitest';

import type { CryptoFee } from '$lib/api/cryptoFees';

import { computeTransferLedgerFinalBtc } from './computeTransferLedgerFinalBtc';

const baseFee: CryptoFee = {
  id: 1,
  portfolio_id: 1,
  asset_id: 1,
  fee_type: 'purchase',
  fee_date: '2025-06-26',
  quantity_moved: 0.00084,
  fee_quantity_btc: 0.00000084,
  quote_brl: 590867,
  fx_rate: 5.54,
  symbol: 'BTC-USD',
  asset_name: 'Bitcoin',
  final_quantity_after_fee: 0.00083916,
  fee_value_brl: 0.5,
  fee_value_usd: 0.09,
  fee_percent: 0.1
};

describe('computeTransferLedgerFinalBtc', () => {
  it('soma apenas final_quantity_after_fee de transferências', () => {
    const transfer: CryptoFee = {
      ...baseFee,
      id: 2,
      fee_type: 'transfer',
      quantity_moved: 0.00083916,
      fee_quantity_btc: 0.00003,
      final_quantity_after_fee: 0.00080916
    };
    const result = computeTransferLedgerFinalBtc([baseFee, transfer]);
    expect(result.totalBtc).toBeCloseTo(0.00080916, 8);
    expect(result.count).toBe(1);
  });

  it('retorna zero sem transferências', () => {
    const result = computeTransferLedgerFinalBtc([baseFee]);
    expect(result.totalBtc).toBe(0);
    expect(result.count).toBe(0);
  });
});
