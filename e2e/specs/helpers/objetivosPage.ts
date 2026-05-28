import { expect, type Page } from '@playwright/test';

import { pickAssetViaTrigger } from './assetPicker';

export async function gotoObjetivosPage(page: Page): Promise<void> {
  await page.goto('/objetivos');
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
