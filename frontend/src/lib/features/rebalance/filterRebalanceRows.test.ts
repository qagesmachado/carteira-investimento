import { describe, expect, it } from 'vitest';

import type { AssetRebalanceRow, ClassRebalanceRow } from '$lib/api/rebalance';

import { filterAssetRebalanceRows, filterClassRebalanceRows } from './filterRebalanceRows';

const classRow = (label: string): ClassRebalanceRow => ({
  display_class: 'stocks',
  label,
  current_value_brl: 1000,
  current_percent: 10,
  target_percent: 20,
  target_value_brl: 2000,
  gap_brl: 1000
});

const assetRow = (symbol: string, name: string): AssetRebalanceRow => ({
  asset_id: 1,
  symbol,
  name,
  asset_type: 'stock',
  current_value_brl: 100,
  current_percent: 5,
  target_percent: 10,
  target_value_brl: 200,
  gap_brl: 100,
  sum_score: 40,
  score_included: true
});

describe('filterRebalanceRows', () => {
  it('filtra classes pelo rótulo', () => {
    const rows = [classRow('Ações/ETF BR'), classRow('Renda fixa')];
    expect(filterClassRebalanceRows(rows, 'renda')).toHaveLength(1);
    expect(filterClassRebalanceRows(rows, '')).toHaveLength(2);
  });

  it('filtra ativos por ticker ou nome', () => {
    const rows = [assetRow('BBSE3', 'BB Seguridade'), assetRow('VOO', 'Vanguard S&P 500')];
    expect(filterAssetRebalanceRows(rows, 'bbse')).toHaveLength(1);
    expect(filterAssetRebalanceRows(rows, 'vanguard')).toHaveLength(1);
    expect(filterAssetRebalanceRows(rows, 'xyz')).toHaveLength(0);
  });
});
