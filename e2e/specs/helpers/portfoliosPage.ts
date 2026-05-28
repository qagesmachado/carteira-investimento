import { expect, type Download, type Locator, type Page } from '@playwright/test';
import path from 'node:path';

import {
  isApiAssetsListResponse,
  isApiImportConfirmResponse,
  isApiImportPreviewResponse,
  isApiPortfolioExportResponse,
  isApiPortfoliosListResponse,
  isApiPositionsResponse,
  isApiQuoteRefreshResponse
} from './apiResponses';
import { pickAssetViaTrigger } from './assetPicker';

export async function gotoPortfoliosPage(page: Page): Promise<void> {
  const portfoliosResponse = page.waitForResponse(
    (r) => isApiPortfoliosListResponse(r, 'GET') && r.ok()
  );
  const assetsResponse = page.waitForResponse(
    (r) => isApiAssetsListResponse(r, 'GET') && r.ok()
  );
  await page.goto('/portfolios');
  await portfoliosResponse;
  await assetsResponse;
}

export function acceptDialogs(page: Page): void {
  page.on('dialog', (dialog) => dialog.accept());
}

export async function createPortfolioViaUI(page: Page, name: string): Promise<void> {
  const createResponse = page.waitForResponse(
    (r) => isApiPortfoliosListResponse(r, 'POST') && r.ok()
  );
  await page.getByRole('heading', { name: 'Nova carteira' }).locator('..').getByPlaceholder('Nome').fill(name);
  await page.getByRole('button', { name: 'Criar' }).click();
  await createResponse;
}

export async function selectPortfolioByName(page: Page, name: string): Promise<void> {
  const positionsWait = page
    .waitForResponse((r) => isApiPositionsResponse(r) && r.ok(), { timeout: 15_000 })
    .catch(() => null);
  await page.getByRole('button', { name, exact: true }).click();
  await positionsWait;
}

export async function expectPortfolioActive(page: Page, name: string): Promise<void> {
  const button = page.getByRole('button').filter({ hasText: name });
  await expect(button.locator('.badge', { hasText: 'ativa' })).toBeVisible();
}

export async function startRenamePortfolio(page: Page): Promise<void> {
  await page.getByRole('heading', { name: 'Carteira ativa' }).locator('..').getByRole('button', { name: 'Editar' }).click();
}

export async function saveRenamePortfolio(page: Page, newName: string): Promise<void> {
  const patchResponse = page.waitForResponse(
    (r) => r.request().method() === 'PATCH' && r.url().includes('/portfolios/') && r.ok()
  );
  await page.getByRole('heading', { name: 'Carteira ativa' }).locator('..').getByLabel('Nome').fill(newName);
  await page.getByRole('button', { name: 'Salvar' }).click();
  await patchResponse;
}

export async function deleteActivePortfolio(page: Page): Promise<void> {
  const deleteResponse = page.waitForResponse(
    (r) => r.request().method() === 'DELETE' && /\/portfolios\/\d+$/.test(new URL(r.url()).pathname)
  );
  await page.getByRole('button', { name: 'Excluir carteira' }).click();
  await deleteResponse;
}

export function positionsSection(page: Page) {
  return page.locator('.card').filter({ has: page.getByRole('heading', { name: 'Posições' }) });
}

export function positionsTable(page: Page) {
  return positionsSection(page).locator('table tbody');
}

export function positionDataRows(page: Page) {
  return positionsTable(page).locator('tr');
}

export async function filterPositionsByText(page: Page, text: string): Promise<void> {
  await positionsSection(page).getByLabel('Buscar').fill(text);
}

export async function clickPositionsColumnSort(page: Page, columnLabel: string): Promise<void> {
  await positionsSection(page)
    .locator('thead th button')
    .filter({ hasText: columnLabel })
    .click();
}

export async function expectPositionRowHidden(page: Page, ticker: string): Promise<void> {
  await expect(positionDataRows(page).filter({ hasText: ticker })).toHaveCount(0);
}

export async function pickAssetInAddForm(page: Page, ticker: string): Promise<void> {
  const section = positionsSection(page);
  const picker = section.locator('.asset-picker');
  await pickAssetViaTrigger(page, picker.locator('button.input'), ticker);
}

export function editPositionModal(page: Page): Locator {
  return page.locator('.modal-box').filter({ has: page.getByRole('heading', { name: /Editar posição/ }) });
}

export async function fillBrDecimalByLabel(
  page: Page,
  label: string | RegExp,
  value: string,
  scope?: Locator
): Promise<void> {
  const root = scope ?? page;
  const input = root.getByRole('textbox', { name: label });
  await input.click();
  await input.fill(value);
  await input.blur();
}

export async function fillMarketPosition(
  page: Page,
  options: { quantity: string; avgPrice: string }
): Promise<void> {
  const section = positionsSection(page);
  await fillBrDecimalByLabel(page, 'Quantidade', options.quantity, section);
  await fillBrDecimalByLabel(page, /Preço médio/, options.avgPrice, section);
}

export async function fillManualPosition(
  page: Page,
  options: { invested: string; current: string; yield: string }
): Promise<void> {
  const section = positionsSection(page);
  await fillBrDecimalByLabel(page, /Valor aplicado/, options.invested, section);
  await fillBrDecimalByLabel(page, /Valor atual/, options.current, section);
  await section.getByPlaceholder('Ex.: 100% CDI').fill(options.yield);
}

export async function clickAddPosition(page: Page): Promise<void> {
  const createResponse = page.waitForResponse(
    (r) => isApiPositionsResponse(r, 'POST') && r.ok()
  );
  await positionsSection(page).getByRole('button', { name: 'Adicionar' }).click();
  await createResponse;
}

export async function expectPositionRow(page: Page, ticker: string): Promise<void> {
  await expect(positionsTable(page).locator('tr').filter({ hasText: ticker })).toBeVisible();
}

export async function clickPositionDetails(page: Page, ticker: string): Promise<void> {
  const row = positionsTable(page)
    .locator('tr')
    .filter({ hasText: ticker })
    .filter({ has: page.getByRole('button', { name: 'Detalhes' }) });
  await row.getByRole('button', { name: 'Detalhes' }).click();
}

export async function expectPositionDetailsVisible(page: Page, text: string | RegExp): Promise<void> {
  await expect(page.locator('[role="region"]').filter({ hasText: text })).toBeVisible();
}

export async function clickEditPosition(page: Page, ticker: string): Promise<void> {
  const row = positionsTable(page).locator('tr').filter({ hasText: ticker });
  await row.getByRole('button', { name: 'Editar' }).click();
}

export async function clickRemovePosition(page: Page, ticker: string): Promise<void> {
  const row = positionsTable(page).locator('tr').filter({ hasText: ticker });
  await row.getByRole('button', { name: 'Remover' }).click();
}

export async function clickRefreshQuotes(page: Page): Promise<void> {
  const refreshResponse = page.waitForResponse(
    (r) => isApiQuoteRefreshResponse(r) && r.ok(),
    { timeout: 60_000 }
  );
  await positionsSection(page).getByRole('button', { name: 'Atualizar cotações' }).click();
  await refreshResponse;
}

export async function expectSummaryByType(page: Page): Promise<void> {
  await expect(positionsSection(page).getByText(/Por tipo:/)).toBeVisible();
}

const CURRENCY_SUMMARY_LABEL: Record<string, RegExp> = {
  BRL: /Real \(BRL\):/,
  USD: /Dólar \(USD\):/
};

export async function expectSummaryTotalsForCurrency(page: Page, currency: string): Promise<void> {
  const pattern = CURRENCY_SUMMARY_LABEL[currency] ?? new RegExp(`${currency}:`);
  await expect(positionsSection(page).getByText(pattern)).toBeVisible();
}

export async function uploadImportFile(page: Page, fixturePath: string): Promise<void> {
  const absolute = path.isAbsolute(fixturePath)
    ? fixturePath
    : path.join(process.cwd(), fixturePath);
  await page.locator('input[type="file"]').setInputFiles(absolute);
}

export async function clickAnalyzeImport(page: Page): Promise<void> {
  const previewResponse = page.waitForResponse(
    (r) => isApiImportPreviewResponse(r) && r.ok(),
    { timeout: 60_000 }
  );
  await page.getByRole('button', { name: 'Analisar importação' }).click();
  await previewResponse;
}

export async function clickConfirmImport(page: Page): Promise<void> {
  const confirmResponse = page.waitForResponse(
    (r) => isApiImportConfirmResponse(r) && r.ok(),
    { timeout: 60_000 }
  );
  await page.getByRole('button', { name: 'Confirmar importação' }).click();
  await confirmResponse;
}

export async function setConflictResolution(
  page: Page,
  symbol: string,
  field: string,
  resolution: 'use_file' | 'keep_base'
): Promise<void> {
  const row = page.locator('table tbody tr').filter({ hasText: symbol }).filter({ hasText: field });
  const value = resolution === 'use_file' ? 'use_file' : 'keep_base';
  await row.locator('select').selectOption(value);
}

export async function clickExportJson(page: Page): Promise<Download> {
  const exportResponse = page.waitForResponse((r) => isApiPortfolioExportResponse(r));
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Exportar JSON' }).click();
  await exportResponse;
  return downloadPromise;
}
