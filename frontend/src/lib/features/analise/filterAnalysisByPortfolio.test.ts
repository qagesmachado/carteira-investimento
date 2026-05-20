import { describe, expect, it } from 'vitest';

import type { AssetAnalysis } from '$lib/api/analysis';

import { filterAnalysisByPortfolio } from './filterAnalysisByPortfolio';

function row(assetId: number, symbol: string): AssetAnalysis {
  return {
    asset_id: assetId,
    symbol,
    name: symbol,
    asset_type: 'stock',
    display_class: 'stocks',
    scores: {},
    summary: {
      fundamental: { score: null, viability: null },
      diagrama: { score: null, viability: null },
      viabilidade: null
    }
  };
}

describe('filterAnalysisByPortfolio', () => {
  it('mantém apenas ativos presentes na carteira', () => {
    const rows = [row(1, 'BBSE3'), row(2, 'WEGE3'), row(3, 'ITSA4')];
    const filtered = filterAnalysisByPortfolio(rows, new Set([1, 3]));
    expect(filtered.map((r) => r.symbol)).toEqual(['BBSE3', 'ITSA4']);
  });

  it('retorna vazio quando nenhum ativo da carteira está na listagem', () => {
    const rows = [row(1, 'BBSE3')];
    expect(filterAnalysisByPortfolio(rows, new Set([99]))).toEqual([]);
  });
});
