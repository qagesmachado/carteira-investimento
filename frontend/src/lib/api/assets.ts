import { API_BASE_URL } from './config';
import { apiFetch } from './http';

export type AssetType = 'stock' | 'etf' | 'fii' | 'fixed_income' | 'crypto' | 'pension' | 'other';
export type AssetMarket = 'national' | 'international';
export type EtfSubtype = 'variable_income' | 'fixed_income';
export type FixedIncomeIndexer = 'prefixed' | 'ipca_plus' | 'post_fixed';
export type DisplayClass =
  | 'stocks'
  | 'funds'
  | 'fixed_income'
  | 'international'
  | 'crypto'
  | 'pension'
  | 'other';

export type AssetLookup = {
  symbol: string;
  name: string;
  asset_type: AssetType;
  market: AssetMarket;
  country?: string | null;
  currency: string;
  sector?: string | null;
  subsector?: string | null;
  segment?: string | null;
  company_cnpj?: string | null;
  payer_cnpj?: string | null;
  payer_name?: string | null;
  quote_source?: string | null;
  current_quote?: number | null;
  fixed_income_indexer?: FixedIncomeIndexer | null;
  fixed_income_yield_description?: string | null;
  fixed_income_title_type?: string | null;
  maturity_date?: string | null;
  purchase_date?: string | null;
};

export type AssetCreate = AssetLookup & {
  etf_subtype?: EtfSubtype | null;
  notes?: string | null;
};

export type Asset = AssetCreate & {
  id: number;
  display_class: DisplayClass;
};

/** Corpo PATCH: campos omitidos não são alterados no servidor. */
export type AssetUpdate = Partial<AssetCreate>;

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }

  return response.json() as Promise<T>;
}

type ApiFetcher = typeof fetch;

export async function lookupAsset(
  symbol: string,
  fetcher: ApiFetcher = apiFetch
): Promise<AssetLookup> {
  const response = await fetcher(
    `${API_BASE_URL}/assets/lookup?symbol=${encodeURIComponent(symbol)}`
  );

  return parseResponse<AssetLookup>(response);
}

export async function createAsset(
  payload: AssetCreate,
  fetcher: ApiFetcher = apiFetch
): Promise<Asset> {
  const response = await fetcher(`${API_BASE_URL}/assets`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<Asset>(response);
}

export async function listAssets(fetcher: ApiFetcher = apiFetch): Promise<Asset[]> {
  const response = await fetcher(`${API_BASE_URL}/assets`);

  return parseResponse<Asset[]>(response);
}

export async function updateAsset(
  id: number,
  payload: AssetUpdate,
  fetcher: typeof fetch = fetch
): Promise<Asset> {
  const response = await fetcher(`${API_BASE_URL}/assets/${id}`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  });

  return parseResponse<Asset>(response);
}

export async function deleteAsset(id: number, fetcher: ApiFetcher = apiFetch): Promise<void> {
  const response = await fetcher(`${API_BASE_URL}/assets/${id}`, {
    method: 'DELETE'
  });

  if (!response.ok) {
    throw new Error(await response.text());
  }
}

export type BulkPreviewItem = {
  symbol: string;
  lookup: AssetLookup | null;
  error: string | null;
  already_in_db: boolean;
};

export type BulkPreviewResponse = {
  items: BulkPreviewItem[];
  warnings?: string[];
};

function bulkPreviewTimeoutMs(symbolCount: number): number {
  return Math.min(300_000, Math.max(30_000, symbolCount * 2_000));
}

export type BulkCreateItemResult = {
  symbol: string;
  status: 'created' | 'skipped' | 'error';
  asset?: Asset;
  detail?: string | null;
};

export type BulkCreateResponse = {
  results: BulkCreateItemResult[];
};

export async function previewBulkAssets(
  symbols: string[],
  fetcher: ApiFetcher = apiFetch
): Promise<BulkPreviewResponse> {
  const response = await fetcher(`${API_BASE_URL}/assets/bulk/preview`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ symbols }),
    timeoutMs: bulkPreviewTimeoutMs(symbols.length)
  });

  return parseResponse<BulkPreviewResponse>(response);
}

export async function createBulkAssets(
  assets: AssetCreate[],
  fetcher: ApiFetcher = apiFetch
): Promise<BulkCreateResponse> {
  const response = await fetcher(`${API_BASE_URL}/assets/bulk`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ assets })
  });

  return parseResponse<BulkCreateResponse>(response);
}

export function lookupToAssetCreate(lookup: AssetLookup): AssetCreate {
  return {
    symbol: lookup.symbol,
    name: lookup.name,
    asset_type: lookup.asset_type,
    market: lookup.market,
    country: lookup.country ?? null,
    currency: lookup.currency,
    etf_subtype: null,
    sector: lookup.sector ?? null,
    subsector: lookup.subsector ?? null,
    segment: lookup.segment ?? null,
    company_cnpj: lookup.company_cnpj ?? null,
    payer_cnpj: lookup.payer_cnpj ?? null,
    payer_name: lookup.payer_name ?? null,
    quote_source: lookup.quote_source ?? null,
    current_quote: lookup.current_quote ?? null,
    notes: null
  };
}

export function isNationalEtfMissingSubtype(asset: AssetCreate): boolean {
  return asset.asset_type === 'etf' && asset.market === 'national' && !asset.etf_subtype;
}
