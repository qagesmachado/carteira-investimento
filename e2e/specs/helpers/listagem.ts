import { expect, type Page } from '@playwright/test';

import { registeredAssetsTable } from './assetsPage';

export function listFilterInput(page: Page) {
  return page.getByPlaceholder('Ex.: EGIE3 ou Engie');
}

export async function filterRegisteredAssets(page: Page, query: string): Promise<void> {
  const input = listFilterInput(page);
  await input.fill(query);
  await expect(input).toHaveValue(query);
  await page.waitForTimeout(250);
}

export async function clearListFilter(page: Page): Promise<void> {
  const input = listFilterInput(page);
  await input.fill('');
  await expect(input).toHaveValue('');
  await page.waitForTimeout(250);
}

export async function expectFilteredRowCount(page: Page, ticker: string, count: number): Promise<void> {
  const table = registeredAssetsTable(page);
  await expect(table.locator('tbody tr').filter({ hasText: ticker })).toHaveCount(count);
}

export async function expectBadgeShowsFiltered(page: Page, visible: number, total: number): Promise<void> {
  await expect(page.getByText(`${visible} de ${total} ativos`, { exact: true })).toBeVisible();
}

export async function clickEditOnRow(page: Page, ticker: string): Promise<void> {
  const row = registeredAssetsTable(page).locator('tbody tr').filter({ hasText: ticker });
  await row.getByRole('button', { name: 'Editar' }).click();
  await expect(page.getByRole('button', { name: 'Atualizar ativo' })).toBeVisible();
}

export async function clickDeleteOnRow(page: Page, ticker: string): Promise<void> {
  const row = registeredAssetsTable(page).locator('tbody tr').filter({ hasText: ticker });
  await row.getByRole('button', { name: 'Excluir' }).click();
}
