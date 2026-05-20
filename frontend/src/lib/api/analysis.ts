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
  summary: AnalysisSummary;
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

export async function getAssetAnalysis(assetId: number): Promise<AssetAnalysis> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/assets/${assetId}?profile=stock_br`);
  return parseResponse<AssetAnalysis>(response);
}

export async function saveAssetAnalysisScores(
  assetId: number,
  scores: Record<string, number | null>
): Promise<AssetAnalysis> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/assets/${assetId}/scores?profile=stock_br`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ scores })
  });
  return parseResponse<AssetAnalysis>(response);
}
