import { describe, expect, it } from 'vitest';

import type { AssetRebalanceRow } from '$lib/api/rebalance';

import { sortAssetRebalanceRows } from './sortAssetRebalanceRows';

function row(
  symbol: string,
  overrides: Partial<AssetRebalanceRow> = {}
): AssetRebalanceRow {
  return {
    asset_id: symbol.length,
    symbol,
    name: symbol,
    asset_type: 'stock',
    current_value_brl: 1000,
    current_percent: 10,
    target_percent: 12,
    target_value_brl: 1200,
    gap_brl: 200,
    sum_score: 50,
    score_included: true,
    ...overrides
  };
}

describe('sortAssetRebalanceRows', () => {
  it('ordena por ticker ascendente', () => {
    const rows = [row('BBB3'), row('AAA3')];
    const sorted = sortAssetRebalanceRows(rows, 'symbol', 'asc');
    expect(sorted.map((r) => r.symbol)).toEqual(['AAA3', 'BBB3']);
  });

  it('ordena por valor atual descendente', () => {
    const rows = [
      row('A', { current_value_brl: 500 }),
      row('B', { current_value_brl: 2000 }),
      row('C', { current_value_brl: 1000 })
    ];
    const sorted = sortAssetRebalanceRows(rows, 'current_value_brl', 'desc');
    expect(sorted.map((r) => r.symbol)).toEqual(['B', 'C', 'A']);
  });

  it('ordena por % desejada com vazios por último', () => {
    const rows = [
      row('A', { target_percent: 30 }),
      row('B', { target_percent: 50 }),
      row('C', { target_percent: null })
    ];
    const sorted = sortAssetRebalanceRows(rows, 'target_percent', 'desc');
    expect(sorted.map((r) => r.symbol)).toEqual(['B', 'A', 'C']);
  });

  it('ordena por aporte sugerido quando valor a investir informado', () => {
    const rows = [
      row('A', { asset_id: 1, current_value_brl: 1000, target_value_brl: 2000 }),
      row('B', { asset_id: 2, current_value_brl: 500, target_value_brl: 1500 })
    ];
    const sorted = sortAssetRebalanceRows(rows, 'suggested_contribution', 'desc', {
      currentPatrimonyBrl: 10_000,
      finalPatrimonyBrl: 20_000,
      classContributionBrl: 10_000
    });
    expect(sorted[0].symbol).toBe('A');
  });
});
