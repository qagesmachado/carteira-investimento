import { expect, type Download, type Locator, type Page } from '@playwright/test';
import path from 'node:path';

import {
  isApiDataAssetsImportConfirmResponse,
  isApiDataAssetsImportPreviewResponse,
  isApiDataExportAssetsResponse,
  isApiDataExportDividendsResponse,
  isApiDataExportFullResponse,
  isApiImportConfirmResponse,
  isApiImportPreviewResponse,
  isApiPortfolioExportResponse,
  isApiPortfoliosListResponse
} from './apiResponses';

export async function gotoDadosPage(page: Page): Promise<void> {
  const portfoliosResponse = page.waitForResponse(
    (r) => isApiPortfoliosListResponse(r, 'GET') && r.ok()
  );
  await page.goto('/dados');
  await portfoliosResponse;
  await expect(page.getByRole('heading', { name: 'Dados', level: 1 })).toBeVisible();
}

export function dadosBackupSection(page: Page): Locator {
  return page.getByTestId('dados-backup');
}

export function dadosCarteiraSection(page: Page): Locator {
  return page.getByTestId('dados-carteira');
}

export function dadosAtivosSection(page: Page): Locator {
  return page.getByTestId('dados-ativos');
}

export function dadosProventosSection(page: Page): Locator {
  return page.getByTestId('dados-proventos');
}

export function portfolioImportSection(page: Page): Locator {
  return dadosCarteiraSection(page).locator('.card').filter({
    has: page.getByRole('heading', { name: 'Importar carteira' })
  });
}

export function assetBulkSection(page: Page): Locator {
  return dadosAtivosSection(page).locator('section').filter({
    has: page.getByRole('heading', { name: 'Cadastro em lote' })
  });
}

export function dividendBulkSection(page: Page): Locator {
  return dadosProventosSection(page).locator('section').filter({
    has: page.getByRole('heading', { name: 'Proventos em lote' })
  });
}

export async function expectDadosSectionsVisible(page: Page): Promise<void> {
  await expect(dadosBackupSection(page).getByRole('heading', { name: 'Backup completo' })).toBeVisible();
  await expect(
    dadosBackupSection(page).getByRole('button', { name: 'Exportar backup JSON' })
  ).toBeVisible();
  await expect(dadosCarteiraSection(page).getByRole('heading', { name: 'Exportar e importar carteira' })).toBeVisible();
  await expect(
    dadosCarteiraSection(page).getByRole('button', { name: 'Exportar carteira JSON' })
  ).toBeVisible();
  await expect(dadosAtivosSection(page).getByRole('heading', { name: 'Catálogo de ativos' })).toBeVisible();
  await expect(
    dadosAtivosSection(page).getByRole('button', { name: 'Exportar catálogo JSON' })
  ).toBeVisible();
  await expect(dadosProventosSection(page).getByRole('heading', { name: 'Exportar e importar proventos' })).toBeVisible();
  await expect(
    dadosProventosSection(page).getByRole('button', { name: 'Exportar proventos CSV' })
  ).toBeVisible();
}

export async function selectActivePortfolioByName(page: Page, name: string): Promise<void> {
  const patchResponse = page
    .waitForResponse(
      (r) => r.request().method() === 'PATCH' && r.url().includes('/portfolios/active'),
      { timeout: 15_000 }
    )
    .catch(() => null);
  await dadosCarteiraSection(page).getByLabel('Selecionar carteira').selectOption({ label: name });
  await patchResponse;
}

export async function selectDividendsExportPortfolio(page: Page, name: string): Promise<void> {
  await dadosProventosSection(page)
    .getByLabel('Carteira para exportação de proventos')
    .selectOption({ label: name });
}

export async function clickExportPortfolioJson(page: Page): Promise<Download> {
  const exportResponse = page.waitForResponse((r) => isApiPortfolioExportResponse(r));
  const downloadPromise = page.waitForEvent('download');
  await dadosCarteiraSection(page).getByRole('button', { name: 'Exportar carteira JSON' }).click();
  await exportResponse;
  return downloadPromise;
}

export async function clickExportAssetsCatalog(page: Page): Promise<Download> {
  const exportResponse = page.waitForResponse((r) => isApiDataExportAssetsResponse(r));
  const downloadPromise = page.waitForEvent('download');
  await dadosAtivosSection(page).getByRole('button', { name: 'Exportar catálogo JSON' }).click();
  await exportResponse;
  return downloadPromise;
}

export async function clickExportDividendsCsv(page: Page): Promise<Download> {
  const exportResponse = page.waitForResponse((r) => isApiDataExportDividendsResponse(r));
  const downloadPromise = page.waitForEvent('download');
  await dadosProventosSection(page).getByRole('button', { name: 'Exportar proventos CSV' }).click();
  await exportResponse;
  return downloadPromise;
}

export async function clickExportFullBackup(page: Page): Promise<Download> {
  const exportResponse = page.waitForResponse((r) => isApiDataExportFullResponse(r));
  const downloadPromise = page.waitForEvent('download');
  await dadosBackupSection(page).getByRole('button', { name: 'Exportar backup JSON' }).click();
  await exportResponse;
  return downloadPromise;
}

export async function uploadPortfolioImportFile(page: Page, fixturePath: string): Promise<void> {
  const absolute = path.isAbsolute(fixturePath)
    ? fixturePath
    : path.join(process.cwd(), fixturePath);
  await portfolioImportSection(page).locator('input[type="file"]').setInputFiles(absolute);
}

export async function clickAnalyzePortfolioImport(page: Page): Promise<void> {
  const previewResponse = page.waitForResponse(
    (r) => isApiImportPreviewResponse(r) && r.ok(),
    { timeout: 60_000 }
  );
  await portfolioImportSection(page).getByRole('button', { name: 'Analisar importação' }).click();
  await previewResponse;
}

export async function clickConfirmPortfolioImport(page: Page): Promise<void> {
  const confirmResponse = page.waitForResponse(
    (r) => isApiImportConfirmResponse(r) && r.ok(),
    { timeout: 60_000 }
  );
  await portfolioImportSection(page).getByRole('button', { name: 'Confirmar importação' }).click();
  await confirmResponse;
}

export async function pasteAssetTickersAndPreview(
  page: Page,
  tickersText: string,
  options: { previewTimeout?: number } = {}
): Promise<void> {
  const section = assetBulkSection(page);
  await section.getByRole('textbox', { name: 'Tickers' }).fill(tickersText);
  await section.getByRole('button', { name: 'Analisar lista' }).click();

  const previewResponse = page.waitForResponse(
    (r) => isApiDataAssetsImportPreviewResponse(r) && r.ok(),
    { timeout: options.previewTimeout ?? 30_000 }
  );
  await section.getByRole('button', { name: 'Buscar no yfinance' }).click();
  await previewResponse;

  await expect(section.getByRole('button', { name: 'Buscando...' })).toBeHidden({
    timeout: options.previewTimeout ?? 30_000
  });
}

export async function saveSelectedAssetBulk(page: Page): Promise<void> {
  const section = assetBulkSection(page);
  const saveButton = section.getByRole('button', { name: /Salvar selecionados/ });

  await expect(saveButton).toBeEnabled();
  const confirmResponse = page.waitForResponse(
    (r) => isApiDataAssetsImportConfirmResponse(r) && r.ok()
  );
  await saveButton.click();
  await confirmResponse;
}

export async function expectAssetBulkPreviewStatus(
  page: Page,
  ticker: string,
  status: string
): Promise<void> {
  const row = assetBulkSection(page).locator('table tbody tr').filter({ hasText: ticker });
  await expect(row).toHaveCount(1);
  await expect(row).toContainText(status);
}

export async function selectDividendImportPortfolio(page: Page, name: string): Promise<void> {
  await dividendBulkSection(page)
    .getByLabel('Carteira de destino da importacao em lote')
    .selectOption({ label: name });
}

export async function readDownloadJson(download: Download): Promise<unknown> {
  const path = await download.path();
  expect(path).toBeTruthy();
  const body = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of body!) {
    chunks.push(Buffer.from(chunk));
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'));
}

export async function readDownloadText(download: Download): Promise<string> {
  const path = await download.path();
  expect(path).toBeTruthy();
  const body = await download.createReadStream();
  const chunks: Buffer[] = [];
  for await (const chunk of body!) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString('utf8');
}
