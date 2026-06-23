import { describe, expect, it } from 'vitest';

import type { AssetPartition } from '$lib/api/objetivos';

import {
  buildPurposeRows,
  computeExcludedRebalanceBrl,
  computeInvestmentValueBrl
} from './positionPurpose';

const partition: AssetPartition = {
  asset_id: 1,
  symbol: 'AUPO11',
  name: 'AUPO11',
  split_mode: 'shares',
  position_total: 100,
  free: 0,
  position_current_value_brl: 10_000,
  position_invested_value_brl: 9_000,
  position_profit_brl: 1_000,
  slices: [
    {
      objective_id: 2,
      objective_name: 'Carteira RF',
      slice_name: 'Investimento',
      is_default: false,
      exclude_from_rebalance: false,
      is_emergency_reserve: false,
      quantity: 60,
      amount: null,
      current_value_brl: 6_000,
      invested_value_brl: 5_400,
      profit_brl: 600
    },
    {
      objective_id: 3,
      objective_name: 'Reserva',
      slice_name: 'Reserva',
      is_default: false,
      exclude_from_rebalance: true,
      is_emergency_reserve: true,
      quantity: 40,
      amount: null,
      current_value_brl: 4_000,
      invested_value_brl: 3_600,
      profit_brl: 400
    }
  ]
};

describe('positionPurpose', () => {
  it('lista uma linha por fatia interna', () => {
    expect(buildPurposeRows(partition)).toHaveLength(2);
    expect(buildPurposeRows(partition)[0].sliceName).toBe('Investimento');
  });

  it('calcula valor excluído do rebalanceamento', () => {
    expect(computeExcludedRebalanceBrl(partition)).toBe(4_000);
  });

  it('calcula valor de investimento', () => {
    expect(computeInvestmentValueBrl(10_000, 4_000)).toBe(6_000);
    expect(computeInvestmentValueBrl(null, 0)).toBeNull();
  });
});
