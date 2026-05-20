import type { Asset, AssetCreate } from './assets';
import { API_BASE_URL } from './config';

export type PortfolioStatus = 'active' | 'archived' | 'simulation';
export type PositionStatus = 'active' | 'closed' | 'watching';

export type Portfolio = {
  id: number;
  name: string;
  description?: string | null;
  holder?: string | null;
  objective?: string | null;
  base_currency: string;
  status: PortfolioStatus;
  allocation_targets_json?: string | null;
  notes?: string | null;
  created_at: string;
  updated_at: string;
};

export type PortfolioCreate = {
  name: string;
  description?: string | null;
  holder?: string | null;
  objective?: string | null;
  base_currency?: string;
  status?: PortfolioStatus;
  allocation_targets_json?: string | null;
  notes?: string | null;
};

export type PortfolioUpdate = Partial<PortfolioCreate>;

export type Position = {
  id: number;
  portfolio_id: number;
  asset_id: number;
  quantity: number;
  average_price: number;
  invested_amount?: number | null;
  current_value?: number | null;
  contracted_yield?: string | null;
  entry_date?: string | null;
  custody?: string | null;
  linked_objective?: string | null;
  notes?: string | null;
  status: PositionStatus;
  created_at: string;
  updated_at: string;
};

export type PositionCreate = {
  asset_id: number;
  quantity?: number;
  average_price?: number;
  invested_amount?: number | null;
  current_value?: number | null;
  contracted_yield?: string | null;
  entry_date?: string | null;
  custody?: string | null;
  linked_objective?: string | null;
  notes?: string | null;
  status?: PositionStatus;
};

export type PositionUpdate = Partial<Omit<PositionCreate, 'asset_id'>>;

export type PortfolioExportDocument = {
  version: number;
  exported_at: string;
  portfolio: PortfolioCreate;
  assets: AssetCreate[];
  positions: PositionExportItem[];
};

export type PositionExportItem = {
  symbol: string;
  quantity?: number;
  average_price?: number;
  invested_amount?: number | null;
  current_value?: number | null;
  contracted_yield?: string | null;
  entry_date?: string | null;
  custody?: string | null;
  linked_objective?: string | null;
  notes?: string | null;
  status?: PositionStatus;
};

export type FieldResolution = 'keep_base' | 'use_file' | 'custom';

export type ImportConflictField = {
  field: string;
  base_value?: string | null;
  file_value?: string | null;
  resolution: FieldResolution;
  custom_value?: string | null;
};

export type ImportAssetPreviewItem = {
  symbol: string;
  status: 'exists_ok' | 'missing' | 'conflict';
  base_asset?: Asset | null;
  file_asset?: AssetCreate | null;
  lookup?: AssetCreate | null;
  fields: ImportConflictField[];
};

export type ImportPreviewResponse = {
  portfolio: PortfolioCreate;
  assets: ImportAssetPreviewItem[];
  positions: PositionExportItem[];
  target_portfolio_id?: number | null;
};

export type ImportAssetResolution = {
  symbol: string;
  action: 'keep' | 'create' | 'update';
  fields?: ImportConflictField[];
  asset_create?: AssetCreate | null;
};

export type QuoteRefreshFailure = {
  symbol: string;
  detail: string;
};

export type QuoteRefreshResponse = {
  updated: number;
  skipped: number;
  failed: QuoteRefreshFailure[];
  refreshed_at: string;
};

export type ImportConfirmResponse = {
  portfolio_id: number;
  portfolio_name: string;
  portfolio_name_adjusted: boolean;
  assets_created: number;
  assets_updated: number;
  positions_imported: number;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function listPortfolios(fetcher: typeof fetch = fetch): Promise<Portfolio[]> {
  const response = await fetcher(`${API_BASE_URL}/portfolios`);
  return parseResponse<Portfolio[]>(response);
}

export async function createPortfolio(
  payload: PortfolioCreate,
  fetcher: typeof fetch = fetch
): Promise<Portfolio> {
  const response = await fetcher(`${API_BASE_URL}/portfolios`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<Portfolio>(response);
}

export async function updatePortfolio(
  id: number,
  payload: PortfolioUpdate,
  fetcher: typeof fetch = fetch
): Promise<Portfolio> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/${id}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<Portfolio>(response);
}

export async function deletePortfolio(id: number, fetcher: typeof fetch = fetch): Promise<void> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/${id}`, { method: 'DELETE' });
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function getActivePortfolioId(fetcher: typeof fetch = fetch): Promise<number | null> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/active`);
  const body = await parseResponse<{ portfolio_id: number | null }>(response);
  return body.portfolio_id;
}

export async function setActivePortfolioId(
  portfolioId: number | null,
  fetcher: typeof fetch = fetch
): Promise<number | null> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/active`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ portfolio_id: portfolioId })
  });
  const body = await parseResponse<{ portfolio_id: number | null }>(response);
  return body.portfolio_id;
}

export async function refreshPortfolioQuotes(
  portfolioId: number,
  fetcher: typeof fetch = fetch
): Promise<QuoteRefreshResponse> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/${portfolioId}/quotes/refresh`, {
    method: 'POST'
  });
  return parseResponse<QuoteRefreshResponse>(response);
}

export async function listPositions(
  portfolioId: number,
  fetcher: typeof fetch = fetch
): Promise<Position[]> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/${portfolioId}/positions`);
  return parseResponse<Position[]>(response);
}

export async function createPosition(
  portfolioId: number,
  payload: PositionCreate,
  fetcher: typeof fetch = fetch
): Promise<Position> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/${portfolioId}/positions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload)
  });
  return parseResponse<Position>(response);
}

export async function updatePosition(
  portfolioId: number,
  positionId: number,
  payload: PositionUpdate,
  fetcher: typeof fetch = fetch
): Promise<Position> {
  const response = await fetcher(
    `${API_BASE_URL}/portfolios/${portfolioId}/positions/${positionId}`,
    {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }
  );
  return parseResponse<Position>(response);
}

export async function deletePosition(
  portfolioId: number,
  positionId: number,
  fetcher: typeof fetch = fetch
): Promise<void> {
  const response = await fetcher(
    `${API_BASE_URL}/portfolios/${portfolioId}/positions/${positionId}`,
    { method: 'DELETE' }
  );
  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export async function exportPortfolio(
  portfolioId: number,
  fetcher: typeof fetch = fetch
): Promise<PortfolioExportDocument> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/${portfolioId}/export`);
  return parseResponse<PortfolioExportDocument>(response);
}

export async function previewPortfolioImport(
  document: PortfolioExportDocument,
  fetcher: typeof fetch = fetch
): Promise<ImportPreviewResponse> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/import/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ document })
  });
  return parseResponse<ImportPreviewResponse>(response);
}

export async function confirmPortfolioImport(
  document: PortfolioExportDocument,
  assetResolutions: ImportAssetResolution[],
  options: { targetPortfolioId?: number | null; createNewPortfolio?: boolean } = {},
  fetcher: typeof fetch = fetch
): Promise<ImportConfirmResponse> {
  const response = await fetcher(`${API_BASE_URL}/portfolios/import`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      document,
      asset_resolutions: assetResolutions,
      target_portfolio_id: options.targetPortfolioId ?? null,
      create_new_portfolio: options.createNewPortfolio ?? true
    })
  });
  return parseResponse<ImportConfirmResponse>(response);
}

export function downloadExportDocument(doc: PortfolioExportDocument, filename: string) {
  const blob = new Blob([JSON.stringify(doc, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
