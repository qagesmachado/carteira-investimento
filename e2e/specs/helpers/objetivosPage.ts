import { expect, type Page } from '@playwright/test';

import { pickAssetViaTrigger } from './assetPicker';

export async function gotoObjetivosPage(page: Page): Promise<void> {
  await page.goto('/ferramentas/objetivos');
  await expect(page.getByRole('heading', { name: 'Objetivos financeiros' })).toBeVisible();
}

export async function selectObjectiveCard(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^${name}`) }).click();
}

export async function selectResumoTab(page: Page): Promise<void> {
  await page.getByTestId('objetivo-tab-resumo').click();
  await expect(page.getByTestId('objetivos-summary')).toBeVisible();
}

export async function createObjectiveUi(page: Page, name: string): Promise<void> {
  await page.getByTestId('objetivo-create-btn').click();
  await page.getByTestId('objetivo-name-input').fill(name);
  await page.getByRole('button', { name: 'Salvar' }).click();
}

export async function createPensionObjectiveUi(
  page: Page,
  options: { name: string; year: number; income: string }
): Promise<void> {
  await page.getByTestId('objetivo-create-btn').click();
  await page.getByTestId('objetivo-mode-pension').click();
  await page.getByTestId('objetivo-name-input').fill(options.name);
  await page.getByTestId('pension-create-year-input').fill(String(options.year));
  await page.getByTestId('pension-create-income-input').fill(options.income);
  await expect(
    page.getByTestId('objetivo-edit-modal').getByRole('button', { name: 'Salvar' })
  ).toBeEnabled();
  await page
    .getByTestId('objetivo-edit-modal')
    .getByRole('button', { name: 'Salvar' })
    .click();
}

export async function savePensionContributionUi(
  page: Page,
  contributed: string
): Promise<void> {
  await page.getByTestId('pension-edit-btn').click();
  await expect(page.getByTestId('pension-year-edit-modal')).toBeVisible();
  await page.getByTestId('pension-contributed-input').fill(contributed);
  await page.getByTestId('pension-save-btn').click();
  await expect(page.getByTestId('pension-year-edit-modal')).not.toBeVisible();
}

export async function addPensionYearUi(
  page: Page,
  options: { year: number; income: string }
): Promise<void> {
  await page.getByTestId('pension-add-year-btn').click();
  await page.getByTestId('pension-new-year-input').fill(String(options.year));
  await page.getByTestId('pension-new-year-income-input').fill(options.income);
  await page.getByRole('button', { name: 'Adicionar' }).click();
}

export async function selectPensionYearTab(page: Page, year: number): Promise<void> {
  await page.getByTestId(`pension-year-tab-${year}`).click();
}

export async function deletePensionYearUi(page: Page): Promise<void> {
  await page.getByTestId('pension-delete-year-btn').click();
}

export async function openAddAssetModal(page: Page): Promise<void> {
  await page.getByTestId('objetivo-add-asset-btn').click();
  await expect(page.getByTestId('objetivo-allocation-modal')).toBeVisible();
}

export async function pickAssetInModal(page: Page, symbol: string): Promise<void> {
  await pickAssetViaTrigger(page, page.locator('.asset-picker button'), symbol);
}

export async function fillAllocationInModal(
  page: Page,
  options: { sliceName: string; shares: string; symbol?: string }
): Promise<void> {
  if (options.symbol) {
    await pickAssetInModal(page, options.symbol);
  }
  await page.getByTestId('allocation-slice-name-input').fill(options.sliceName);
  await page.getByTestId('allocation-shares-input').fill(options.shares);
  await page.getByTestId('allocation-save-btn').click();
}

export async function expectAllocationSliceVisible(page: Page, sliceName: string): Promise<void> {
  await expect(
    page.locator('[data-testid^="objetivo-allocation-"] td.font-medium', { hasText: sliceName })
  ).toBeVisible();
}
