import { expect, type Page } from '@playwright/test';

import { isApiAssetsListResponse, isApiLookupResponse } from './apiResponses';
import {
  LOOKUP_ERROR_MESSAGE,
  LOOKUP_SUCCESS_MESSAGE,
  lookupForm,
  registeredAssetsTable,
  reviewForm,
  SAVE_SUCCESS_MESSAGE
} from './assetsPage';
import { DUPLICATE_TICKER_MESSAGE } from './e2eFixtures';

export async function searchTicker(
  page: Page,
  ticker: string,
  options: { lookupTimeout?: number } = {}
): Promise<void> {
  const form = lookupForm(page);
  const searchInput = form.getByRole('textbox', { name: 'Ticker ou símbolo' });
  await searchInput.fill(ticker);

  const lookupResponse = page.waitForResponse(
    (response) => isApiLookupResponse(response) && response.ok(),
    { timeout: options.lookupTimeout ?? 15_000 }
  );
  await form.getByRole('button', { name: 'Buscar ativo' }).click();
  await lookupResponse;

  await expect(page.getByRole('button', { name: 'Buscando...' })).toBeHidden({
    timeout: options.lookupTimeout ?? 15_000
  });
}

export async function searchInvalidTicker(page: Page, ticker: string): Promise<void> {
  const form = lookupForm(page);
  await form.getByRole('textbox', { name: 'Ticker ou símbolo' }).fill(ticker);
  await form.getByRole('button', { name: 'Buscar ativo' }).click();
  await expect(page.getByRole('alert').filter({ hasText: LOOKUP_ERROR_MESSAGE })).toBeVisible({
    timeout: 15_000
  });
}

export async function expectReviewFormFlexible(page: Page, ticker: string): Promise<void> {
  const form = reviewForm(page);
  await expect(page.getByRole('alert').filter({ hasText: LOOKUP_SUCCESS_MESSAGE })).toBeVisible();
  await expect(form.getByLabel('Ticker', { exact: true })).toHaveValue(ticker);
  const name = await form.getByLabel('Nome', { exact: true }).inputValue();
  expect(name.trim().length).toBeGreaterThan(0);
}

export async function saveReviewForm(page: Page): Promise<void> {
  const form = reviewForm(page);
  const createResponse = page.waitForResponse(
    (response) => isApiAssetsListResponse(response, 'POST') && response.ok()
  );
  await form.getByRole('button', { name: 'Salvar ativo' }).click();
  await createResponse;
  await expect(page.getByRole('alert').filter({ hasText: SAVE_SUCCESS_MESSAGE })).toBeVisible();
}

export async function saveReviewFormExpectDuplicate(page: Page): Promise<void> {
  const form = reviewForm(page);
  await form.getByRole('button', { name: 'Salvar ativo' }).click();
  await expect(page.getByRole('alert').filter({ hasText: DUPLICATE_TICKER_MESSAGE })).toBeVisible();
}

export async function saveEtfWithSubtypeRf(page: Page, ticker: string): Promise<void> {
  const form = reviewForm(page);
  const subtype = form.getByLabel('Tipo do ETF nacional');
  await expect(subtype).toBeVisible();
  await subtype.selectOption('fixed_income');
  await saveReviewForm(page);
  const table = registeredAssetsTable(page);
  const row = table.locator('tbody tr').filter({ hasText: ticker });
  await expect(row).toContainText('ETF');
}

export async function dismissAlert(page: Page): Promise<void> {
  const alert = page.locator('[role="alert"]').first();
  await expect(alert).toBeVisible();
  await alert.getByRole('button', { name: 'Fechar mensagem' }).click();
  await expect(alert).not.toBeVisible();
}
