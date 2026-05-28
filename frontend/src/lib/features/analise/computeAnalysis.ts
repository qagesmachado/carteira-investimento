export type AnalysisBlock = 'fundamental' | 'diagrama';

export const VIABILIDADE_CODE = 'viabilidade';
export const PVP_DESCARTE_CODE = 'pvp_descarte';
export const SEGMENTO_FII_CODE = 'segmento_fii';
export const PROFILE_STOCK_BR = 'stock_br';
export const PROFILE_FII_BR = 'fii_br';

export type ScoreOption = {
  value: number;
  label: string;
  seal?: string;
  characteristic?: string;
  color?: string | null;
};

export type CriterionDefinition = {
  code: string;
  block: AnalysisBlock;
  label: string;
  help_text?: string;
  weight?: number;
  sort_order?: number;
  input_type?: string;
  score_options: ScoreOption[];
};

export type ViabilityBand = {
  id: string;
  label: string;
  min_score: number;
  color?: string | null;
};

export type ViabilityRule = {
  block: AnalysisBlock | string;
  method: string;
  bands: ViabilityBand[];
};

export type ViabilityResult = {
  block: string;
  score: number | null;
  band_id: string | null;
  label: string;
  color?: string | null;
};

export type BlockSummary = {
  score: number | null;
  viability: ViabilityResult | null;
};

export type AnalysisSummary = {
  fundamental: BlockSummary;
  diagrama: BlockSummary;
  viabilidade: ViabilityResult | null;
};

export type TableSumColumnSettings = {
  enabled: boolean;
  label: string;
  diagram_multiplier: number;
  viabilidade_weights: ViabilidadeWeightSettings;
};

export type ViabilidadeWeightSettings = {
  azulim: number;
  viavel: number;
  atencao: number;
  bomba: number;
};

export type TableDisplaySettings = {
  sum_column: TableSumColumnSettings;
};

export const FUNDAMENTAL_SUM_CODES_BY_PROFILE: Record<string, readonly string[]> = {
  stock_br: ['lucros', 'divida', 'tag_along', 'segmento'],
  fii_br: ['vacancia', 'qtd_ativos', 'alavancagem', SEGMENTO_FII_CODE]
};

export const FUNDAMENTAL_SUM_CODES = FUNDAMENTAL_SUM_CODES_BY_PROFILE.stock_br;

export function isPvpDiscarded(scores: Record<string, number | null | undefined>): boolean {
  return scores[PVP_DESCARTE_CODE] === 1;
}

function fundamentalSumCodesForProfile(profile: string): readonly string[] {
  return FUNDAMENTAL_SUM_CODES_BY_PROFILE[profile] ?? FUNDAMENTAL_SUM_CODES;
}

function collectWeightedScores(
  scores: Record<string, number | null | undefined>,
  criteria: CriterionDefinition[]
): Array<[number, number]> {
  const byCode = Object.fromEntries(criteria.map((c) => [c.code, c]));
  const pairs: Array<[number, number]> = [];

  for (const [code, value] of Object.entries(scores)) {
    if (value == null) continue;
    const criterion = byCode[code];
    if (!criterion) continue;
    const weight = criterion.weight && criterion.weight > 0 ? criterion.weight : 1;
    pairs.push([value, weight]);
  }

  return pairs;
}

export function computeBlockNumericScore(
  scores: Record<string, number | null | undefined>,
  criteria: CriterionDefinition[],
  method: string
): number | null {
  const pairs = collectWeightedScores(scores, criteria);
  if (pairs.length === 0) return null;

  const values = pairs.map(([v]) => v);
  if (method === 'min') return Math.min(...values);
  if (method === 'weighted_average') {
    const totalW = pairs.reduce((sum, [, w]) => sum + w, 0);
    if (totalW <= 0) return null;
    return pairs.reduce((sum, [v, w]) => sum + v * w, 0) / totalW;
  }
  if (method === 'weighted_min') {
    return Math.min(...pairs.map(([v, w]) => v * w));
  }
  throw new Error(`Unknown method: ${method}`);
}

export function computeDiagramSumScore(
  scores: Record<string, number | null | undefined>,
  criteria: CriterionDefinition[]
): number | null {
  let total = 0;
  let answered = 0;
  for (const criterion of criteria) {
    if (criterion.input_type === 'flag') continue;
    const value = scores[criterion.code];
    if (value == null) continue;
    total += value;
    answered += 1;
  }
  return answered > 0 ? total : null;
}

export function resolveViabilidadeTableWeight(
  score: number | null | undefined,
  weights: ViabilidadeWeightSettings
): number | null {
  if (score == null) return null;
  switch (score) {
    case 1:
      return weights.azulim;
    case 2:
      return weights.viavel;
    case 3:
      return weights.atencao;
    case 4:
      return weights.bomba;
    default:
      return null;
  }
}

export function computeTableSumScore(
  scores: Record<string, number | null | undefined>,
  summary: AnalysisSummary,
  settings: TableSumColumnSettings,
  profile: string = PROFILE_STOCK_BR
): number | null {
  if (!settings.enabled) return null;
  if (isPvpDiscarded(scores)) return null;

  let total = 0;
  let hasAny = false;

  for (const code of fundamentalSumCodesForProfile(profile)) {
    const value = scores[code];
    if (value != null) {
      total += value;
      hasAny = true;
    }
  }

  const viabilidadeWeight = resolveViabilidadeTableWeight(
    scores[VIABILIDADE_CODE],
    settings.viabilidade_weights
  );
  if (viabilidadeWeight != null) {
    total += viabilidadeWeight;
    hasAny = true;
  }

  if (summary.diagrama.score != null) {
    total += settings.diagram_multiplier * summary.diagrama.score;
    hasAny = true;
  }

  return hasAny ? total : null;
}

export function resolveManualViability(
  score: number | null | undefined,
  criterion: CriterionDefinition | undefined
): ViabilityResult | null {
  if (score == null || !criterion) return null;
  const option = criterion.score_options.find((o) => o.value === score);
  if (!option) return null;
  const seal = option.seal || option.label;
  return {
    block: 'viabilidade',
    score,
    band_id: seal.toLowerCase().replace(/\s+/g, '_'),
    label: `${option.value} - ${seal.toUpperCase()}`,
    color: option.color ?? null
  };
}

export function summarizeAnalysis(
  scores: Record<string, number | null | undefined>,
  criteria: CriterionDefinition[],
  _rules: ViabilityRule[]
): AnalysisSummary {
  const byBlock: Record<string, CriterionDefinition[]> = {};
  for (const c of criteria) {
    byBlock[c.block] = byBlock[c.block] ?? [];
    byBlock[c.block].push(c);
  }

  const fundamentalAll = byBlock.fundamental ?? [];
  const fundamentalCriteria = fundamentalAll.filter(
    (c) =>
      c.code !== VIABILIDADE_CODE &&
      ((c.input_type ?? 'select') === 'select' || (c.input_type ?? 'select') === 'segment')
  );
  const viabilidadeCriterion = fundamentalAll.find((c) => c.code === VIABILIDADE_CODE);
  const diagramaCriteria = byBlock.diagrama ?? [];

  return {
    fundamental: {
      score: computeBlockNumericScore(scores, fundamentalCriteria, 'min'),
      viability: null
    },
    diagrama: {
      score: computeDiagramSumScore(scores, diagramaCriteria),
      viability: null
    },
    viabilidade: resolveManualViability(scores[VIABILIDADE_CODE], viabilidadeCriterion)
  };
}
