import { expect, type Download, type Page } from '@playwright/test';
import path from 'node:path';

import { isApiPortfoliosListResponse } from './apiResponses';

export async function gotoConferenciaIrPage(page: Page): Promise<void> {
  const portfoliosResponse = page.waitForResponse(
    (r) => isApiPortfoliosListResponse(r, 'GET') && r.ok()
  );
  await page.goto('/conferencia-ir');
  await portfoliosResponse;
  await expect(
    page.getByRole('heading', { name: 'Conferência anual de IR', level: 1 })
  ).toBeVisible();
}

export async function selectIrYear(page: Page, year: number): Promise<void> {
  const reportResponse = page.waitForResponse(
    (r) => r.url().includes('/annual-ir-report?') && r.request().method() === 'GET' && r.ok()
  );
  await page.getByTestId('ir-year-select').selectOption(String(year));
  await reportResponse;
}

export async function clickIrTab(page: Page, tab: 'detalhado' | 'resumo' | 'posicoes'): Promise<void> {
  await page.getByTestId(`ir-tab-${tab}`).click();
}

export async function freezeIrSnapshot(page: Page): Promise<void> {
  page.once('dialog', (dialog) => dialog.accept());

  await expect(page.getByTestId('ir-freeze-snapshot-btn')).toBeEnabled();

  const createResponse = page.waitForResponse(
    (r) => r.url().includes('/year-snapshots') && r.request().method() === 'POST' && r.ok(),
    { timeout: 30_000 }
  );
  await page.getByTestId('ir-freeze-snapshot-btn').click();
  await createResponse;

  await expect(page.getByTestId('ir-tab-posicoes')).toHaveClass(/tab-active/, { timeout: 30_000 });
  await expect(page.getByTestId('ir-table-posicoes')).toBeVisible({ timeout: 30_000 });
  await expect(page.getByTestId('ir-no-snapshot-warning')).toHaveCount(0);
}

export async function clickExportIrExcel(page: Page): Promise<Download> {
  const downloadPromise = page.waitForEvent('download');
  await page.getByTestId('ir-export-excel-btn').click();
  return downloadPromise;
}

export async function readDownloadXlsxSheetNames(download: Download): Promise<string[]> {
  const body = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of body!) {
    chunks.push(Buffer.from(chunk));
  }
  const buffer = Buffer.concat(chunks);
  const xlsxModulePath = path.resolve(process.cwd(), '../frontend/node_modules/xlsx/xlsx.mjs');
  const XLSX = await import(xlsxModulePath);
  const workbook = XLSX.read(buffer, { type: 'buffer' });
  return workbook.SheetNames;
}

export async function filterIrMarket(
  page: Page,
  market: '' | 'national' | 'international'
): Promise<void> {
  await page.getByTestId('ir-filter-market').selectOption(market);
}

export async function expectTableHasTicker(
  page: Page,
  tableTestId: string,
  ticker: string
): Promise<void> {
  await expect(
    page.getByTestId(tableTestId).getByRole('cell', { name: ticker, exact: true }).first()
  ).toBeVisible();
}

export async function expectTableMissingTicker(
  page: Page,
  tableTestId: string,
  ticker: string
): Promise<void> {
  await expect(
    page.getByTestId(tableTestId).getByRole('cell', { name: ticker, exact: true })
  ).toHaveCount(0);
}
