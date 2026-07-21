import { expect, type Locator, type Page } from '@playwright/test';

import { isApiDividendBulkCreateResponse, isApiDividendBulkPreviewResponse } from './apiResponses';

/** Seção «Proventos em lote» na aba Adicionar de /proventos. */
export function dividendBulkSection(page: Page): Locator {
  return page.getByTestId('proventos-import-lote-section');
}

export async function pasteDividendCsvAndAnalyze(page: Page, csvText: string): Promise<void> {
  const section = dividendBulkSection(page);
  await section.getByRole('textbox', { name: 'Conteúdo CSV' }).fill(csvText);
  await section.getByRole('button', { name: 'Analisar conteúdo' }).click();
}

export async function previewDividendBulkOnServer(
  page: Page,
  options: { timeout?: number } = {}
): Promise<void> {
  const section = dividendBulkSection(page);
  const previewResponse = page.waitForResponse(
    (r) => isApiDividendBulkPreviewResponse(r) && r.ok(),
    { timeout: options.timeout ?? 30_000 }
  );
  await section.getByRole('button', { name: 'Pré-visualizar no servidor' }).click();
  await previewResponse;
}

export async function importSelectedDividends(page: Page): Promise<void> {
  const section = dividendBulkSection(page);
  const importButton = section.getByRole('button', { name: /Importar selecionados/ });
  await expect(importButton).toBeEnabled();
  const createResponse = page.waitForResponse(
    (r) => isApiDividendBulkCreateResponse(r) && r.ok()
  );
  await importButton.click();
  await createResponse;
}

export async function expectPreviewRowStatus(
  page: Page,
  ticker: string,
  status: string
): Promise<void> {
  const row = dividendBulkSection(page).locator('table tbody tr').filter({ hasText: ticker });
  await expect(row).toContainText(status);
}

export const DIVIDEND_CSV_TEMPLATE = `ticker;data;valor;tipo
ITSA4;10/05/2024;12,50;dividend`;

export const DIVIDEND_CSV_LEGACY = `Ativo;Tipo de provento;Data;Valor em reais
ITSA4;Dividendo;15/03/2024;25,00`;
