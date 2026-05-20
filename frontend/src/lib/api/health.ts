import { API_BASE_URL } from './config';

export type HealthResponse = {
  status: string;
};

export async function getHealth(fetcher: typeof fetch = fetch): Promise<HealthResponse> {
  const response = await fetcher(`${API_BASE_URL}/health`);

  if (!response.ok) {
    throw new Error('Falha ao consultar a API');
  }

  return response.json() as Promise<HealthResponse>;
}
