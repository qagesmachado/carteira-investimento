import { API_BASE_URL } from './config';

export type UsdBrlState = {
  rate: number | null;
  refreshed_at: string | null;
};

export type UsdBrlRefreshResponse = {
  rate: number;
  refreshed_at: string;
};

async function parseResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<T>;
}

export async function getUsdBrl(fetcher: typeof fetch = fetch): Promise<UsdBrlState> {
  const response = await fetcher(`${API_BASE_URL}/fx/usd-brl`);
  return parseResponse<UsdBrlState>(response);
}

export async function refreshUsdBrl(
  fetcher: typeof fetch = fetch
): Promise<UsdBrlRefreshResponse> {
  const response = await fetcher(`${API_BASE_URL}/fx/usd-brl/refresh`, { method: 'POST' });
  return parseResponse<UsdBrlRefreshResponse>(response);
}
