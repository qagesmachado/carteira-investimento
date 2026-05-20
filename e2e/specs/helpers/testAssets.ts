import { expect, type APIRequestContext } from '@playwright/test';

export async function clearAllTestAssets(
  request: APIRequestContext,
  apiBaseUrl: string
): Promise<void> {
  const listResponse = await request.get(`${apiBaseUrl}/assets`);
  expect(listResponse.ok()).toBeTruthy();

  const assets = (await listResponse.json()) as { id: number }[];
  for (const asset of assets) {
    const deleteResponse = await request.delete(`${apiBaseUrl}/assets/${asset.id}`);
    expect(deleteResponse.ok()).toBeTruthy();
  }
}
