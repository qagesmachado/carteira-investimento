import { API_BASE_URL } from './config';
import { apiFetch } from './http';

type ApiFetcher = typeof apiFetch;

export type AppInfo = {
  app_version: string;
  schema_version: number;
  db_user_version: number;
  db_up_to_date: boolean;
  python_version: string;
  database_path: string;
  lookup_mode: string;
};

export async function getAppInfo(fetcher: ApiFetcher = apiFetch): Promise<AppInfo> {
  const response = await fetcher(`${API_BASE_URL}/info`);
  if (!response.ok) {
    throw new Error(await response.text());
  }
  return response.json() as Promise<AppInfo>;
}
