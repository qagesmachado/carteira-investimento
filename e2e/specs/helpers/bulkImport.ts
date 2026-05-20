import { expect, type Page } from '@playwright/test';

import { isApiAssetsListResponse } from './apiResponses';
import { registeredAssetsTable } from './assetsPage';

export function bulkSection(page: Page) {
  return page.locator('section').filter({ has: page.getByRole('heading', { name: 'Cadastro em lote' }) });
}

export async function pasteTickersAndPreview(
  page: Page,
  tickersText: string,
  options: { previewTimeout?: number } = {}
): Promise<void> {
  const section = bulkSection(page);
  await section.getByRole('textbox', { name: 'Tickers' }).fill(tickersText);
  await section.getByRole('button', { name: 'Analisar lista' }).click();

  const previewResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/assets/bulk/preview') &&
      response.ok(),
    { timeout: options.previewTimeout ?? 30_000 }
  );
  await section.getByRole('button', { name: 'Buscar no yfinance' }).click();
  await previewResponse;

  await expect(page.getByRole('button', { name: 'Buscando...' })).toBeHidden({
    timeout: options.previewTimeout ?? 30_000
  });
}

export async function saveAllSelectedBulk(page: Page): Promise<void> {
  const section = bulkSection(page);
  const saveButton = section.getByRole('button', { name: /Salvar selecionados/ });

  await expect(saveButton).toBeEnabled();
  const bulkCreateResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/assets/bulk') &&
      !response.url().includes('/preview') &&
      response.ok()
  );
  await saveButton.click();
  await bulkCreateResponse;
}

export async function expectRegisteredTickers(page: Page, tickers: string[]): Promise<void> {
  const table = registeredAssetsTable(page);
  for (const ticker of tickers) {
    await expect(table.locator('tbody tr').filter({ hasText: ticker })).toHaveCount(1);
  }
}

export async function expectPreviewRowStatus(
  page: Page,
  ticker: string,
  status: string
): Promise<void> {
  const section = bulkSection(page);
  const row = section.locator('table tbody tr').filter({ hasText: ticker });
  await expect(row).toContainText(status);
}

export async function setBulkEtfSubtypeRf(page: Page, ticker: string): Promise<void> {
  const section = bulkSection(page);
  const row = section.locator('table tbody tr').filter({ hasText: ticker });
  await row.getByRole('button', { name: 'Editar' }).click();

  const dialog = page.getByRole('dialog').filter({ hasText: 'Revisar ativo do lote' });
  await expect(dialog).toBeVisible();
  await dialog.getByRole('combobox', { name: 'Tipo', exact: true }).selectOption('etf');
  await dialog.getByLabel('Tipo do ETF nacional').selectOption('fixed_income');
  await dialog.getByRole('button', { name: 'Confirmar' }).click();
  await expectPreviewRowStatus(page, ticker, 'Revisado');
}

export async function reloadAssetsList(page: Page): Promise<void> {
  const listAfterReload = page.waitForResponse(
    (response) => isApiAssetsListResponse(response, 'GET') && response.ok()
  );
  await page.reload();
  await listAfterReload;
}
