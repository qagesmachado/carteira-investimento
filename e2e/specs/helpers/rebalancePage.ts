import { expect, type Locator, type Page } from '@playwright/test';

export async function gotoRebalancePage(page: Page): Promise<void> {
  await page.goto('/rebalanceamento');
  await expect(page.getByRole('heading', { name: 'Rebalanceamento' })).toBeVisible();
}

export function assetRebalanceTableSection(page: Page): Locator {
  return page.locator('section').filter({ hasText: 'Por ativo' });
}

export function assetRebalanceDataRows(page: Page): Locator {
  return assetRebalanceTableSection(page).locator('table tbody tr');
}

export async function clickAssetRebalanceColumnSort(
  page: Page,
  columnLabel: string
): Promise<void> {
  await assetRebalanceTableSection(page)
    .locator('thead th button')
    .filter({ hasText: columnLabel })
    .click();
}

export async function gotoRebalanceConfigPage(page: Page): Promise<void> {
  await page.goto('/rebalanceamento/configuracao');
  await expect(page.getByRole('heading', { name: 'Metas de rebalanceamento' })).toBeVisible();
}

export function balanceamentoTableSection(page: Page): Locator {
  return page.locator('section').filter({ hasText: 'Balanceamento desejado' });
}

export async function fillInvestmentAmount(page: Page, amount: string): Promise<void> {
  const table = balanceamentoTableSection(page);
  await table.getByLabel('Valor a investir').fill(amount);
  await table.getByLabel('Valor a investir').blur();
}

export async function toggleClassInclusion(
  page: Page,
  classLabel: string,
  checked: boolean
): Promise<void> {
  const table = balanceamentoTableSection(page);
  const checkbox = table.getByRole('checkbox', { name: `Incluir ${classLabel} no aporte` });
  if (checked) {
    await checkbox.check();
  } else {
    await checkbox.uncheck();
  }
}

export async function expectRebalanceClassRow(
  page: Page,
  label: string,
  targetPercent: string
): Promise<void> {
  const table = balanceamentoTableSection(page);
  const row = table.getByRole('row').filter({ hasText: label });
  await expect(row).toContainText(targetPercent);
}
