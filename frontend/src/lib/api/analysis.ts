import { API_BASE_URL } from './config';
import { apiFetch } from './http';
import {
  ANALYSIS_PENDING_PROFILES,
  buildPortfolioPendingGroups
} from '$lib/features/analise/buildPortfolioPendingGroups';

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
  use_fundamental: boolean;
  use_diagram: boolean;
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
  is_pending?: boolean;
};

export type AnalysisPortfolioSummary = {
  portfolio_id: number;
  classified_count: number;
  pending_count: number;
  profiles: Array<{
    profile: string;
    total: number;
    classified: number;
    pending: number;
  }>;
};

export type PendingAssetSummary = {
  asset_id: number;
  symbol: string;
  name: string;
  asset_type: string;
  profile: string;
};

export type PendingAssetsGroup = {
  profile: string;
  assets: PendingAssetSummary[];
};

export type AnalysisPortfolioPending = {
  portfolio_id: number;
  groups: PendingAssetsGroup[];
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
export const PROFILE_CRYPTO = 'crypto';

export type AnalysisMethodology = 'simples' | 'auvp';

export type AnalysisMethodologyRead = {
  portfolio_id: number;
  profile: string;
  methodology: AnalysisMethodology;
};

export type AnalysisProfileSlug = 'stock-br' | 'fii-br' | 'etf-intl' | 'crypto';

export const PROFILE_TO_SLUG: Record<string, AnalysisProfileSlug> = {
  [PROFILE_STOCK_BR]: 'stock-br',
  [PROFILE_FII_BR]: 'fii-br',
  [PROFILE_ETF_INTL]: 'etf-intl',
  [PROFILE_CRYPTO]: 'crypto'
};

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

export async function listStockBrAnalysis(portfolioId?: number | null): Promise<AssetAnalysis[]> {
  const query = portfolioId != null ? `&portfolio_id=${portfolioId}` : '';
  const response = await apiFetch(`${API_BASE_URL}/analysis/assets?profile=stock_br${query}`);
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

export async function listFiiBrAnalysis(portfolioId?: number | null): Promise<AssetAnalysis[]> {
  const query = portfolioId != null ? `&portfolio_id=${portfolioId}` : '';
  const response = await apiFetch(`${API_BASE_URL}/analysis/assets?profile=fii_br${query}`);
  return parseResponse<AssetAnalysis[]>(response);
}

export async function getAnalysisPortfolioSummary(
  portfolioId: number
): Promise<AnalysisPortfolioSummary> {
  const response = await apiFetch(
    `${API_BASE_URL}/analysis/portfolio-summary?portfolio_id=${portfolioId}`
  );
  return parseResponse<AnalysisPortfolioSummary>(response);
}

export async function getAnalysisPortfolioPending(
  portfolioId: number
): Promise<AnalysisPortfolioPending> {
  const response = await apiFetch(
    `${API_BASE_URL}/analysis/portfolio-pending?portfolio_id=${portfolioId}`
  );
  if (response.ok) {
    return parseResponse<AnalysisPortfolioPending>(response);
  }
  if (response.status === 404) {
    return loadPortfolioPendingFromAnalysisAssets(portfolioId);
  }
  return parseResponse<AnalysisPortfolioPending>(response);
}

async function loadPortfolioPendingFromAnalysisAssets(
  portfolioId: number
): Promise<AnalysisPortfolioPending> {
  const rowsByProfile: Record<string, AssetAnalysis[]> = {};
  await Promise.all(
    ANALYSIS_PENDING_PROFILES.map(async (profile) => {
      const assetsResponse = await apiFetch(
        `${API_BASE_URL}/analysis/assets?profile=${profile}&portfolio_id=${portfolioId}`
      );
      if (!assetsResponse.ok) {
        throw new Error(await assetsResponse.text());
      }
      rowsByProfile[profile] = (await assetsResponse.json()) as AssetAnalysis[];
    })
  );
  return buildPortfolioPendingGroups(portfolioId, rowsByProfile);
}

export async function setAssetPending(
  assetId: number,
  portfolioId: number,
  isPending: boolean,
  profile: string = PROFILE_STOCK_BR
): Promise<AssetAnalysis> {
  const response = await apiFetch(
    `${API_BASE_URL}/analysis/assets/${assetId}/pending?profile=${profile}`,
    {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ portfolio_id: portfolioId, is_pending: isPending })
    }
  );
  return parseResponse<AssetAnalysis>(response);
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

export async function listEtfIntlAnalysis(portfolioId: number): Promise<AssetAnalysis[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/analysis/assets?profile=etf_intl&portfolio_id=${portfolioId}`
  );
  return parseResponse<AssetAnalysis[]>(response);
}

export async function saveEtfIntlAllocations(
  portfolioId: number,
  allocations: EtfIntlAllocationInput[]
): Promise<AssetAnalysis[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/etf-intl/allocations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId, allocations })
  });
  return parseResponse<AssetAnalysis[]>(response);
}

export async function getCryptoConfig(): Promise<AnalysisConfig> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/crypto/config`);
  return parseResponse<AnalysisConfig>(response);
}

export async function listCryptoAnalysis(portfolioId: number): Promise<AssetAnalysis[]> {
  const response = await apiFetch(
    `${API_BASE_URL}/analysis/assets?profile=crypto&portfolio_id=${portfolioId}`
  );
  return parseResponse<AssetAnalysis[]>(response);
}

export async function saveCryptoAllocations(
  portfolioId: number,
  allocations: EtfIntlAllocationInput[]
): Promise<AssetAnalysis[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/crypto/allocations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId, allocations })
  });
  return parseResponse<AssetAnalysis[]>(response);
}

export async function saveStockBrAllocations(
  portfolioId: number,
  allocations: EtfIntlAllocationInput[]
): Promise<AssetAnalysis[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/stock-br/allocations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId, allocations })
  });
  return parseResponse<AssetAnalysis[]>(response);
}

export async function saveFiiBrAllocations(
  portfolioId: number,
  allocations: EtfIntlAllocationInput[]
): Promise<AssetAnalysis[]> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/fii-br/allocations`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId, allocations })
  });
  return parseResponse<AssetAnalysis[]>(response);
}

export async function getAnalysisMethodology(
  profileSlug: AnalysisProfileSlug,
  portfolioId: number
): Promise<AnalysisMethodologyRead> {
  const response = await apiFetch(
    `${API_BASE_URL}/analysis/profiles/${profileSlug}/methodology?portfolio_id=${portfolioId}`
  );
  return parseResponse<AnalysisMethodologyRead>(response);
}

export async function saveAnalysisMethodology(
  profileSlug: AnalysisProfileSlug,
  portfolioId: number,
  methodology: AnalysisMethodology
): Promise<AnalysisMethodologyRead> {
  const response = await apiFetch(`${API_BASE_URL}/analysis/profiles/${profileSlug}/methodology`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId, methodology })
  });
  return parseResponse<AnalysisMethodologyRead>(response);
}
