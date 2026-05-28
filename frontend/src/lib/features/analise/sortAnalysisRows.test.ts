import { describe, expect, it } from 'vitest';

import type { AssetAnalysis, TableSumColumnSettings } from '$lib/api/analysis';

import { sortAnalysisRows } from './sortAnalysisRows';

const sumColumn: TableSumColumnSettings = {
  enabled: true,
  label: 'Soma',
  diagram_multiplier: 2,
  viabilidade_weights: {
    azulim: 10,
    viavel: 3,
    atencao: -5,
    bomba: -10
  }
};

function row(
  symbol: string,
  scores: Record<string, number | null>,
  diagramScore: number | null = null
): AssetAnalysis {
  return {
    asset_id: symbol.length,
    symbol,
    name: symbol,
    asset_type: 'stock',
    display_class: 'stocks',
    scores,
    summary: {
      fundamental: { score: null, viability: null },
      diagrama: { score: diagramScore, viability: null },
      viabilidade: null
    }
  };
}

describe('sortAnalysisRows', () => {
  it('ordena por ticker ascendente', () => {
    const rows = [row('WEGE3', {}), row('CAML3', {})];
    const sorted = sortAnalysisRows(rows, 'symbol', 'asc', sumColumn);
    expect(sorted.map((r) => r.symbol)).toEqual(['CAML3', 'WEGE3']);
  });

  it('ordena por lucros descendente com vazios por último', () => {
    const rows = [
      row('A', { lucros: 3 }),
      row('B', { lucros: 5 }),
      row('C', { lucros: null })
    ];
    const sorted = sortAnalysisRows(rows, 'lucros', 'desc', sumColumn);
    expect(sorted.map((r) => r.symbol)).toEqual(['B', 'A', 'C']);
  });

  it('ordena por soma calculada', () => {
    const rows = [
      row('A', { lucros: 5, divida: 5, tag_along: 5, segmento: 5, viabilidade: 2 }, 1),
      row('B', { lucros: 2, divida: 2, tag_along: 2, segmento: 2, viabilidade: 3 }, 5)
    ];
    const sorted = sortAnalysisRows(rows, 'soma', 'desc', sumColumn);
    expect(sorted[0].symbol).toBe('A');
  });
});
