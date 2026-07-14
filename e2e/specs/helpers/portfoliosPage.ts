import { expect, type Download, type Locator, type Page } from '@playwright/test';
import path from 'node:path';

import {
  isApiAssetsListResponse,
  isApiImportConfirmResponse,
  isApiImportPreviewResponse,
  isApiPortfolioExportResponse,
  isApiPortfolioSummariesResponse,
  isApiPortfoliosListResponse,
  isApiPositionsResponse,
  isApiQuoteRefreshResponse
} from './apiResponses';
import { pickAssetViaTrigger } from './assetPicker';

export async function gotoPortfoliosHub(page: Page): Promise<void> {
  const portfoliosResponse = page.waitForResponse(
    (r) => isApiPortfoliosListResponse(r, 'GET') && r.ok()
  );
  const summariesResponse = page.waitForResponse(
    (r) => isApiPortfolioSummariesResponse(r) && r.ok()
  );
  await page.goto('/portfolios');
  await portfoliosResponse;
  await summariesResponse;
}

/** @deprecated Prefer `gotoPortfoliosHub` ou `gotoPortfolioPositions`. */
export async function gotoPortfoliosPage(page: Page): Promise<void> {
  await gotoPortfoliosHub(page);
}

export async function gotoPortfolioPositions(page: Page, portfolioId: number): Promise<void> {
  await page.goto(`/portfolios/${portfolioId}`);
  await expect(page.getByRole('heading', { name: 'Posições da carteira' })).toBeVisible({
    timeout: 15_000
  });
  await expect(page.getByRole('heading', { name: 'Carteira ativa' })).toBeVisible({
    timeout: 15_000
  });
}

export function acceptDialogs(page: Page): void {
  page.on('dialog', (dialog) => dialog.accept());
}

export function createPortfolioModal(page: Page): Locator {
  return page.getByTestId('create-portfolio-modal');
}

export async function openCreatePortfolioModal(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Nova carteira' }).click();
  await expect(createPortfolioModal(page)).toBeVisible();
}

const INVESTOR_PROFILE_TEST_ID_BY_LABEL: Record<string, string> = {
  Conservador: 'conservative',
  Moderado: 'moderate',
  Arrojado: 'bold',
  Personalizado: 'custom'
};

export async function createPortfolioViaUI(
  page: Page,
  name: string,
  options: {
    profileLabel?: string;
    templateLabel?: string;
    customAllocation?: Partial<Record<'stocks' | 'funds' | 'international' | 'fixed_income' | 'crypto', number>>;
  } = {}
): Promise<number> {
  await openCreatePortfolioModal(page);
  const modal = createPortfolioModal(page);

  if (options.profileLabel) {
    const profileId = INVESTOR_PROFILE_TEST_ID_BY_LABEL[options.profileLabel];
    if (profileId) {
      await modal.getByTestId(`investor-profile-${profileId}`).click();
    } else {
      await modal.getByText(options.profileLabel, { exact: true }).click();
    }
  }
  if (options.customAllocation) {
    for (const [key, value] of Object.entries(options.customAllocation)) {
      const slider = modal.getByTestId(`custom-allocation-slider-${key}`);
      await slider.evaluate((el, nextValue) => {
        const input = el as HTMLInputElement;
        input.value = String(nextValue);
        input.dispatchEvent(new Event('input', { bubbles: true }));
      }, value);
    }
  }
  if (options.templateLabel) {
    await modal.getByRole('button').filter({ hasText: options.templateLabel }).first().click();
  }

  await modal.getByLabel('Nome da carteira').fill(name);

  const createResponse = page.waitForResponse(
    (r) => isApiPortfoliosListResponse(r, 'POST') && r.ok()
  );
  await modal.getByRole('button', { name: 'Criar carteira' }).click();
  const created = await createResponse;
  const body = (await created.json()) as { id: number };
  await page.waitForURL(new RegExp(`/portfolios/${body.id}$`));
  await expect(page.getByRole('heading', { name: 'Posições da carteira' })).toBeVisible();
  return body.id;
}

export async function openPortfolioFromHubByName(page: Page, name: string): Promise<void> {
  const card = page.getByTestId('portfolio-hub-card').filter({ hasText: name });
  const positionsWait = page
    .waitForResponse((r) => isApiPositionsResponse(r, 'GET') && r.ok(), { timeout: 15_000 })
    .catch(() => null);
  await card.getByRole('button', { name: 'Gerenciar posições' }).click();
  await positionsWait;
  await expect(page.getByRole('heading', { name: 'Posições da carteira' })).toBeVisible();
}

export async function selectPortfolioByName(page: Page, name: string): Promise<void> {
  const positionsWait = page
    .waitForResponse((r) => isApiPositionsResponse(r, 'GET') && r.ok(), { timeout: 15_000 })
    .catch(() => null);
  await page.getByTestId('portfolio-positions-select').selectOption({ label: name });
  await positionsWait;
  await page.waitForURL(/\/portfolios\/\d+$/);
}

export async function expectPortfolioActiveOnHub(page: Page, name: string): Promise<void> {
  const card = page.getByTestId('portfolio-hub-card').filter({ hasText: name });
  await expect(card).toHaveAttribute('data-active', 'true');
}

export async function expectPortfolioActive(page: Page, name: string): Promise<void> {
  if (!page.url().endsWith('/portfolios') && page.url().includes('/portfolios/')) {
    await expect(
      page.locator('[data-testid="portfolio-positions-select"] option:checked')
    ).toHaveText(name);
    return;
  }
  await expectPortfolioActiveOnHub(page, name);
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

export function addAssetModal(page: Page): Locator {
  return page
    .locator('.modal-box')
    .filter({ has: page.getByRole('heading', { name: 'Adicionar ativo à carteira' }) });
}

export async function openAddAssetModal(page: Page): Promise<void> {
  await positionsSection(page)
    .getByRole('button', { name: 'Adicionar ativo à carteira' })
    .click();
  await expect(addAssetModal(page)).toBeVisible();
}

export async function selectAddKind(
  page: Page,
  name: 'Bolsa' | 'Renda fixa' | 'Previdência'
): Promise<void> {
  await addAssetModal(page).getByRole('tab', { name }).click();
}

export async function pickAssetInAddForm(page: Page, ticker: string): Promise<void> {
  await openAddAssetModal(page);
  const picker = addAssetModal(page).locator('.asset-picker');
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
  const modal = addAssetModal(page);
  await fillBrDecimalByLabel(page, 'Quantidade', options.quantity, modal);
  await fillBrDecimalByLabel(page, /Preço médio/, options.avgPrice, modal);
}

export async function clickAddPosition(page: Page): Promise<void> {
  const createResponse = page.waitForResponse(
    (r) => isApiPositionsResponse(r, 'POST') && r.ok()
  );
  await addAssetModal(page).getByRole('button', { name: 'Adicionar' }).click();
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

export async function expectHubPortfolioCardMetrics(page: Page, name: string): Promise<void> {
  const card = page.getByTestId('portfolio-hub-card').filter({ hasText: name });
  await expect(card.getByText('Total aplicado')).toBeVisible();
  await expect(card.getByText('Total atual')).toBeVisible();
  await expect(card.getByText('Lucro')).toBeVisible();
  await expect(card.getByTestId('portfolio-hub-allocation')).toBeVisible();
  await expect(card.getByText('Balanceamento sugerido')).toBeVisible();
}

export async function editPortfolioFromHub(
  page: Page,
  name: string,
  fields: { holder?: string; objective?: string; newName?: string }
): Promise<void> {
  const card = page.getByTestId('portfolio-hub-card').filter({ hasText: name });
  await card.getByTestId('portfolio-hub-edit').click();
  const modal = page.getByTestId('edit-portfolio-modal');
  await expect(modal).toBeVisible();

  if (fields.newName != null) {
    await modal.getByLabel('Nome da carteira').fill(fields.newName);
  }
  if (fields.holder != null) {
    await modal.getByLabel('Titular').fill(fields.holder);
  }
  if (fields.objective != null) {
    await modal.getByLabel('Objetivo').fill(fields.objective);
  }

  const patchResponse = page.waitForResponse(
    (r) => r.request().method() === 'PATCH' && r.url().includes('/portfolios/') && r.ok()
  );
  await modal.getByTestId('edit-portfolio-save').click();
  await patchResponse;
  await expect(modal).toHaveCount(0);
}

export async function deletePortfolioFromHub(page: Page, name: string): Promise<void> {
  const card = page.getByTestId('portfolio-hub-card').filter({ hasText: name });
  const deleteResponse = page.waitForResponse(
    (r) => r.request().method() === 'DELETE' && /\/portfolios\/\d+/.test(new URL(r.url()).pathname)
  );
  await card.getByTestId('portfolio-hub-delete').click();
  await deleteResponse;
}
