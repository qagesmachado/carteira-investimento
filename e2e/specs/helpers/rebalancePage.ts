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

export async function expectRebalanceClassRow(
  page: Page,
  label: string,
  targetPercent: string
): Promise<void> {
  const table = page.locator('section').filter({ hasText: 'Balanceamento desejado' });
  const row = table.getByRole('row').filter({ hasText: label });
  await expect(row).toContainText(targetPercent);
}
