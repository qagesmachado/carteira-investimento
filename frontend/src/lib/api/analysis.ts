import { API_BASE_URL } from './config';
import { apiFetch } from './http';

export type ScoreOption = {
  value: number;
  label: string;
  seal?: string;
  characteristic?: string;
  color?: string | null;
};

export type CriterionDefinition = {
  code: string;
  block: string;
  label: string;
  help_text: string;
  weight: number;
  sort_order: number;
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
  block: string;
  method: string;
  bands: ViabilityBand[];
};

export type ViabilidadeWeightSettings = {
  azulim: number;
  viavel: number;
  atencao: number;
  bomba: number;
};

export type TableSumColumnSettings = {
  enabled: boolean;
  label: string;
  diagram_multiplier: number;
  viabilidade_weights: ViabilidadeWeightSettings;
};

export type TableDisplaySettings = {
  sum_column: TableSumColumnSettings;
};

export type AnalysisConfig = {
  profile: string;
  criteria: CriterionDefinition[];
  rules: ViabilityRule[];
  table_display: TableDisplaySettings;
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

export type AssetAnalysis = {
  asset_id: number;
  symbol: string;
  name: string;
  asset_type: string;
  display_class: string;
  scores: Record<string, number | null>;
  score_refs?: Record<string, string | null>;
  summary: AnalysisSummary;
};

export type SegmentCatalogEntry = {
  slug: string;
  name: string;
  score: number;
  weight: number;
  help_text: string;
  color?: string | null;
  sort_order: number;
};

export const PROFILE_STOCK_BR = 'stock_br';
export const PROFILE_FII_BR = 'fii_br';
export const PROFILE_ETF_INTL = 'etf_intl';

export type EtfIntlAllocationInput = {
  asset_id: number;
  target_percent: number;
  analysis_link?: string | null;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function getStockBrConfig(): Promise<AnalysisConfig> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/stock-br/config`);
  return parseResponse<AnalysisConfig>(response);
}

export async function saveStockBrConfig(payload: {
  criteria: CriterionDefinition[];
  rules: ViabilityRule[];
  table_display?: TableDisplaySettings;
}): Promise<AnalysisConfig> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/stock-br/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<AnalysisConfig>(response);
}

export async function resetStockBrConfig(): Promise<AnalysisConfig> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/stock-br/config/reset`, {
    method: 'POST'
  });
  return parseResponse<AnalysisConfig>(response);
}

export async function listStockBrAnalysis(): Promise<AssetAnalysis[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/assets?profile=stock_br`);
  return parseResponse<AssetAnalysis[]>(response);
}

export async function getAssetAnalysis(
  assetId: number,
  profile: string = PROFILE_STOCK_BR
): Promise<AssetAnalysis> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/assets/${assetId}?profile=${profile}`);
  return parseResponse<AssetAnalysis>(response);
}

export async function saveAssetAnalysisScores(
  assetId: number,
  scores: Record<string, number | null>,
  profile: string = PROFILE_STOCK_BR,
  scoreRefs: Record<string, string | null> = {}
): Promise<AssetAnalysis> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/assets/${assetId}/scores?profile=${profile}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scores, score_refs: scoreRefs })
  });
  return parseResponse<AssetAnalysis>(response);
}

export async function getFiiBrConfig(): Promise<AnalysisConfig> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/fii-br/config`);
  return parseResponse<AnalysisConfig>(response);
}

export async function saveFiiBrConfig(payload: {
  criteria: CriterionDefinition[];
  rules: ViabilityRule[];
  table_display?: TableDisplaySettings;
}): Promise<AnalysisConfig> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/fii-br/config`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<AnalysisConfig>(response);
}

export async function resetFiiBrConfig(): Promise<AnalysisConfig> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/fii-br/config/reset`, {
    method: 'POST'
  });
  return parseResponse<AnalysisConfig>(response);
}

export async function listFiiBrAnalysis(): Promise<AssetAnalysis[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/assets?profile=fii_br`);
  return parseResponse<AssetAnalysis[]>(response);
}

export async function getFiiSegments(): Promise<SegmentCatalogEntry[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/fii-br/segments`);
  return parseResponse<SegmentCatalogEntry[]>(response);
}

export async function saveFiiSegments(segments: SegmentCatalogEntry[]): Promise<SegmentCatalogEntry[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/fii-br/segments`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ segments })
  });
  return parseResponse<SegmentCatalogEntry[]>(response);
}

export async function resetFiiSegments(): Promise<SegmentCatalogEntry[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/fii-br/segments/reset`, {
    method: 'POST'
  });
  return parseResponse<SegmentCatalogEntry[]>(response);
}

export async function getEtfIntlConfig(): Promise<AnalysisConfig> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/etf-intl/config`);
  return parseResponse<AnalysisConfig>(response);
}

export async function listEtfIntlAnalysis(): Promise<AssetAnalysis[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/assets?profile=etf_intl`);
  return parseResponse<AssetAnalysis[]>(response);
}

export async function saveEtfIntlAllocations(
  allocations: EtfIntlAllocationInput[]
): Promise<AssetAnalysis[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/etf-intl/allocations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ allocations })
  });
  return parseResponse<AssetAnalysis[]>(response);
}
