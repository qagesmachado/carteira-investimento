import { expect, type APIRequestContext, type Page } from '@playwright/test';

import { API_BASE_URL, isApiAssetsListResponse } from './apiResponses';
import {
  E2E_CDB_IDENTIFIER,
  E2E_CDB_NAME,
  TICKER_BBSE3,
  TICKER_FLRY3,
  TICKER_ITSA4,
  TICKER_PETR4
} from './e2eFixtures';
import { clearAllTestAssets } from './testAssets';

export { clearAllTestAssets };

type AssetPayload = {
  symbol: string;
  name: string;
  asset_type: string;
  market: string;
  country: string;
  currency: string;
  sector?: string | null;
  etf_subtype?: string | null;
  fixed_income_indexer?: string | null;
  fixed_income_yield_description?: string | null;
  fixed_income_title_type?: string | null;
  maturity_date?: string | null;
  purchase_date?: string | null;
};

export async function createAssetViaApi(
  request: APIRequestContext,
  payload: AssetPayload
): Promise<{ id: number; symbol: string }> {
  const response = await request.post(`${API_BASE_URL}/assets`, { data: payload });
  expect(response.ok()).toBeTruthy();
  const body = (await response.json()) as { id: number; symbol: string };
  return body;
}

export async function seedAssetFromLookup(
  request: APIRequestContext,
  symbol: string,
  extra?: Partial<AssetPayload>
): Promise<void> {
  const lookupResponse = await request.get(
    `${API_BASE_URL}/assets/lookup?symbol=${encodeURIComponent(symbol)}`
  );
  expect(lookupResponse.ok()).toBeTruthy();
  const lookup = (await lookupResponse.json()) as AssetPayload;

  await createAssetViaApi(request, {
    symbol: lookup.symbol,
    name: lookup.name,
    asset_type: lookup.asset_type,
    market: lookup.market,
    country: lookup.country ?? 'BR',
    currency: lookup.currency,
    sector: lookup.sector ?? null,
    ...extra
  });
}

export async function seedBbse3(request: APIRequestContext): Promise<void> {
  await deleteAssetBySymbolIfExists(request, TICKER_BBSE3);
  await seedAssetFromLookup(request, TICKER_BBSE3);
}

export async function seedItsa4(request: APIRequestContext): Promise<void> {
  await deleteAssetBySymbolIfExists(request, TICKER_ITSA4);
  await seedAssetFromLookup(request, TICKER_ITSA4);
}

export async function seedFlry3(request: APIRequestContext): Promise<void> {
  await deleteAssetBySymbolIfExists(request, TICKER_FLRY3);
  await seedAssetFromLookup(request, TICKER_FLRY3);
}

export async function seedCatalogForFilter(request: APIRequestContext): Promise<void> {
  await clearAllTestAssets(request, API_BASE_URL);
  await seedAssetFromLookup(request, TICKER_BBSE3);
  await seedAssetFromLookup(request, TICKER_PETR4);
  await seedAssetFromLookup(request, 'FESA4');
}

export async function seedManyAssetsForPagination(
  request: APIRequestContext,
  count = 25
): Promise<void> {
  await clearAllTestAssets(request, API_BASE_URL);
  for (let index = 1; index <= count; index += 1) {
    const suffix = String(index).padStart(2, '0');
    await createAssetViaApi(request, {
      symbol: `E2E-PAG-${suffix}`,
      name: `Ativo paginação ${suffix}`,
      asset_type: 'stock',
      market: 'national',
      country: 'BR',
      currency: 'BRL'
    });
  }
}

export async function seedManualFixedIncome(request: APIRequestContext): Promise<void> {
  await deleteAssetBySymbolIfExists(request, E2E_CDB_IDENTIFIER);
  await createAssetViaApi(request, {
    symbol: E2E_CDB_IDENTIFIER,
    name: E2E_CDB_NAME,
    asset_type: 'fixed_income',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    fixed_income_indexer: 'ipca_plus',
    fixed_income_yield_description: 'IPCA + 8,4% a.a.',
    fixed_income_title_type: 'cdb',
    maturity_date: '2028-12-31',
    purchase_date: '2024-01-15'
  });
}

export async function deleteAssetBySymbolIfExists(
  request: APIRequestContext,
  symbol: string
): Promise<void> {
  const listResponse = await request.get(`${API_BASE_URL}/assets`);
  expect(listResponse.ok()).toBeTruthy();

  const assets = (await listResponse.json()) as { id: number; symbol: string }[];
  const target = symbol.trim().toUpperCase().replace(/\.SA$/, '');

  for (const asset of assets) {
    const normalized = asset.symbol.trim().toUpperCase().replace(/\.SA$/, '');
    if (normalized === target) {
      const deleteResponse = await request.delete(`${API_BASE_URL}/assets/${asset.id}`);
      expect(deleteResponse.ok()).toBeTruthy();
    }
  }
}

export async function gotoAssetsPage(page: Page): Promise<void> {
  const listAssetsResponse = page.waitForResponse(
    (response) => isApiAssetsListResponse(response, 'GET') && response.ok()
  );
  await page.goto('/assets');
  await listAssetsResponse;
  await expect(page.getByText('Não foi possível carregar os ativos cadastrados.')).not.toBeVisible();
}

