import { expect, type APIRequestContext, type Locator, type Page } from '@playwright/test';

import { API_BASE_URL } from './apiResponses';
import { LOOKUP_ERROR_MESSAGE as LOOKUP_ERROR } from './e2eFixtures';

export const LOOKUP_SUCCESS_MESSAGE = 'Ativo encontrado. Revise os dados antes de salvar.';
export const LOOKUP_ERROR_MESSAGE = LOOKUP_ERROR;
export const SAVE_SUCCESS_MESSAGE = 'Ativo salvo na base local.';

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

export function registeredAssetsTable(page: Page) {
  return page
    .locator('section')
    .filter({ has: page.getByRole('heading', { name: 'Ativos cadastrados' }) })
    .locator('table');
}

export function lookupForm(page: Page) {
  return page.locator('form').filter({
    has: page.getByRole('heading', { name: 'Pré-cadastro via yfinance' })
  });
}

export function reviewForm(page: Page) {
  return page.locator('form').filter({
    has: page.getByRole('heading', { name: 'Dados do ativo' })
  });
}
