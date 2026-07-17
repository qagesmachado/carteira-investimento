import { describe, expect, it } from 'vitest';

import type { AssetAnalysis } from '$lib/api/analysis';

import { buildPortfolioPendingGroups } from './buildPortfolioPendingGroups';

function asset(
  id: number,
  symbol: string,
  isPending: boolean,
  profileRows: Partial<AssetAnalysis> = {}
): AssetAnalysis {
  return {
    asset_id: id,
    symbol,
    name: symbol,
    asset_type: 'stock',
    display_class: 'stocks',
    scores: {},
    summary: {
      fundamental: { score: null, viability: null },
      diagrama: { score: null, viability: null },
      viabilidade: null
    },
    is_pending: isPending,
    ...profileRows
  };
}

describe('buildPortfolioPendingGroups', () => {
  it('agrupa apenas ativos pendentes por profile', () => {
    const pending = buildPortfolioPendingGroups(3, {
      stock_br: [asset(1, 'BBSE3', true), asset(2, 'PETR4', false)],
      fii_br: [asset(3, 'HGLG11', true)]
    });

    expect(pending.portfolio_id).toBe(3);
    expect(pending.groups).toHaveLength(2);
    expect(pending.groups[0]).toEqual({
      profile: 'stock_br',
      assets: [
        {
          asset_id: 1,
          symbol: 'BBSE3',
          name: 'BBSE3',
          asset_type: 'stock',
          profile: 'stock_br'
        }
      ]
    });
    expect(pending.groups[1].profile).toBe('fii_br');
  });
});
