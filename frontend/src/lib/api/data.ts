import type { AssetCreate } from './assets';
import {
  type BulkCreateItemResult,
  type BulkCreateResponse,
  type BulkPreviewItem,
  type BulkPreviewResponse
} from './assets';
import { API_BASE_URL } from './config';
import type {
  BulkDividendCreateResponse,
  BulkDividendImportRow,
  BulkDividendPreviewItem,
  BulkDividendPreviewResponse,
  DividendPaymentCreate
} from './dividendPayments';
import { apiFetch } from './http';

export {
  confirmPortfolioImport,
  downloadExportDocument,
  exportPortfolio,
  previewPortfolioImport,
  type ImportAssetPreviewItem,
  type ImportAssetResolution,
  type ImportConfirmResponse,
  type ImportConflictField,
  type ImportPreviewResponse,
  type PortfolioExportDocument
} from './portfolios';

type ApiFetcher = typeof fetch;

export type AssetsExportDocument = {
  version: number;
  exported_at: string;
  assets: AssetCreate[];
};

export type FullBackupDocument = {
  version: number;
  exported_at: string;
  type: string;
  portfolios: unknown[];
  assets: AssetCreate[];
  positions: unknown[];
  dividend_payments: unknown[];
  app_preferences: unknown[];
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

async function parseTextResponse(response: Response): Promise<string> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.text();
}

function bulkPreviewTimeoutMs(symbolCount: number): number {
  return Math.min(300_000, Math.max(30_000, symbolCount * 2_000));
}

export async function exportAssets(fetcher: ApiFetcher = apiFetch): Promise<AssetsExportDocument> {
  const response = await fetcher(`${API_BASE_URL}/data/export/assets`);
  return parseResponse<AssetsExportDocument>(response);
}

export async function exportFullBackup(fetcher: ApiFetcher = apiFetch): Promise<FullBackupDocument> {
  const response = await fetcher(`${API_BASE_URL}/data/export/full`);
  return parseResponse<FullBackupDocument>(response);
}

export async function exportDividendsCsv(
  portfolioId: number,
  fetcher: ApiFetcher = apiFetch
): Promise<string> {
  const response = await fetcher(
    `${API_BASE_URL}/data/export/dividends?portfolio_id=${portfolioId}&format=csv`
  );
  return parseTextResponse(response);
}

export async function previewImportAssets(
  symbols: string[],
  fetcher: ApiFetcher = apiFetch
): Promise<BulkPreviewResponse> {
  const response = await fetcher(`${API_BASE_URL}/data/import/assets/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols }),
    timeoutMs: bulkPreviewTimeoutMs(symbols.length)
  });
  return parseResponse<BulkPreviewResponse>(response);
}

export async function confirmImportAssets(
  assets: AssetCreate[],
  fetcher: ApiFetcher = apiFetch
): Promise<BulkCreateResponse> {
  const response = await fetcher(`${API_BASE_URL}/data/import/assets/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assets })
  });
  return parseResponse<BulkCreateResponse>(response);
}

export async function previewImportDividends(
  items: BulkDividendImportRow[],
  options: { portfolio_id?: number | null } = {},
  fetcher: ApiFetcher = apiFetch
): Promise<BulkDividendPreviewResponse> {
  const body: Record<string, unknown> = { items };
  if (options.portfolio_id != null) {
    body.portfolio_id = options.portfolio_id;
  }
  const response = await fetcher(`${API_BASE_URL}/data/import/dividends/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body)
  });
  return parseResponse<BulkDividendPreviewResponse>(response);
}

export async function confirmImportDividends(
  payments: DividendPaymentCreate[],
  options: { portfolio_id: number },
  fetcher: ApiFetcher = apiFetch
): Promise<BulkDividendCreateResponse> {
  const response = await fetcher(`${API_BASE_URL}/data/import/dividends/confirm`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ payments, portfolio_id: options.portfolio_id })
  });
  return parseResponse<BulkDividendCreateResponse>(response);
}

export function downloadJsonDocument(
  data: unknown,
  filename: string,
  mimeType = 'application/json'
) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: mimeType });
  triggerDownload(blob, filename);
}

export function downloadCsvText(content: string, filename: string) {
  const blob = new Blob([content], { type: 'text/csv;charset=utf-8' });
  triggerDownload(blob, filename);
}

export function downloadAssetsExport(doc: AssetsExportDocument, filename = 'ativos.catalogo.json') {
  downloadJsonDocument(doc, filename);
}

export function downloadFullBackup(doc: FullBackupDocument, filename = 'carteira.backup.json') {
  downloadJsonDocument(doc, filename);
}

function triggerDownload(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

export type {
  AssetCreate,
  BulkCreateItemResult,
  BulkCreateResponse,
  BulkDividendCreateResponse,
  BulkDividendImportRow,
  BulkDividendPreviewItem,
  BulkDividendPreviewResponse,
  BulkPreviewItem,
  BulkPreviewResponse,
  DividendPaymentCreate
};
