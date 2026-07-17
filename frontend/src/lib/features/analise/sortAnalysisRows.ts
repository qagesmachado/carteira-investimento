import { PROFILE_STOCK_BR, type AssetAnalysis, type TableSumColumnSettings } from '$lib/api/analysis';

import { computeCombinedTableScore, computeFundamentalTableScore } from './computeAnalysis';

export type AnalysisSortKey =
  | 'symbol'
  | 'name'
  | 'asset_type'
  | 'lucros'
  | 'divida'
  | 'tag_along'
  | 'segmento'
  | 'vacancia'
  | 'qtd_ativos'
  | 'alavancagem'
  | 'segmento_fii'
  | 'viabilidade'
  | 'fundamental'
  | 'diagrama'
  | 'soma';

export type SortDirection = 'asc' | 'desc';

function compareNullableNumber(
  a: number | null,
  b: number | null,
  factor: number
): number {
  if (a == null && b == null) {
    return 0;
  }
  if (a == null) {
    return 1;
  }
  if (b == null) {
    return -1;
  }
  return (a - b) * factor;
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, 'pt-BR', { sensitivity: 'base' });
}

function scoreValue(row: AssetAnalysis, code: string): number | null {
  return row.scores[code] ?? null;
}

function fundamentalValue(
  row: AssetAnalysis,
  sumColumn: TableSumColumnSettings | null | undefined,
  profile: string = PROFILE_STOCK_BR
): number | null {
  if (!sumColumn) return null;
  return computeFundamentalTableScore(row.scores, sumColumn, profile);
}

function combinedValue(
  row: AssetAnalysis,
  sumColumn: TableSumColumnSettings | null | undefined,
  profile: string = PROFILE_STOCK_BR
): number | null {
  if (!sumColumn) return null;
  return computeCombinedTableScore(row.scores, row.summary, sumColumn, profile);
}

export function sortAnalysisRows(
  rows: AssetAnalysis[],
  key: AnalysisSortKey,
  direction: SortDirection,
  sumColumn: TableSumColumnSettings | null | undefined,
  profile: string = PROFILE_STOCK_BR
): AssetAnalysis[] {
  const factor = direction === 'asc' ? 1 : -1;
  return [...rows].sort((a, b) => {
    let cmp = 0;
    switch (key) {
      case 'symbol':
        cmp = compareText(a.symbol, b.symbol);
        break;
      case 'name':
        cmp = compareText(a.name, b.name);
        break;
      case 'asset_type':
        cmp = compareText(a.asset_type, b.asset_type);
        break;
      case 'lucros':
        cmp = compareNullableNumber(scoreValue(a, 'lucros'), scoreValue(b, 'lucros'), factor);
        break;
      case 'divida':
        cmp = compareNullableNumber(scoreValue(a, 'divida'), scoreValue(b, 'divida'), factor);
        break;
      case 'tag_along':
        cmp = compareNullableNumber(scoreValue(a, 'tag_along'), scoreValue(b, 'tag_along'), factor);
        break;
      case 'segmento':
        cmp = compareNullableNumber(scoreValue(a, 'segmento'), scoreValue(b, 'segmento'), factor);
        break;
      case 'vacancia':
        cmp = compareNullableNumber(scoreValue(a, 'vacancia'), scoreValue(b, 'vacancia'), factor);
        break;
      case 'qtd_ativos':
        cmp = compareNullableNumber(scoreValue(a, 'qtd_ativos'), scoreValue(b, 'qtd_ativos'), factor);
        break;
      case 'alavancagem':
        cmp = compareNullableNumber(scoreValue(a, 'alavancagem'), scoreValue(b, 'alavancagem'), factor);
        break;
      case 'segmento_fii':
        cmp = compareNullableNumber(
          scoreValue(a, 'segmento_fii'),
          scoreValue(b, 'segmento_fii'),
          factor
        );
        break;
      case 'viabilidade':
        cmp = compareNullableNumber(scoreValue(a, 'viabilidade'), scoreValue(b, 'viabilidade'), factor);
        break;
      case 'fundamental':
        cmp = compareNullableNumber(
          fundamentalValue(a, sumColumn, profile),
          fundamentalValue(b, sumColumn, profile),
          factor
        );
        break;
      case 'diagrama':
        cmp = compareNullableNumber(a.summary.diagrama.score, b.summary.diagrama.score, factor);
        break;
      case 'soma':
        cmp = compareNullableNumber(
          combinedValue(a, sumColumn, profile),
          combinedValue(b, sumColumn, profile),
          factor
        );
        break;
      default:
        cmp = 0;
    }

    if (cmp === 0 && key !== 'symbol') {
      cmp = compareText(a.symbol, b.symbol);
    }

    if (key === 'symbol' || key === 'name' || key === 'asset_type') {
      return cmp * factor;
    }

    return cmp;
  });
}

export function toggleSortDirection(direction: SortDirection): SortDirection {
  return direction === 'asc' ? 'desc' : 'asc';
}
