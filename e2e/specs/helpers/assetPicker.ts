import { expect, type Locator, type Page } from '@playwright/test';

/** Painel do AssetPicker é renderizado via portal (body ou dialog). */
export async function pickAssetViaTrigger(
  page: Page,
  trigger: Locator,
  ticker: string
): Promise<void> {
  await trigger.click();
  const panel = page.getByRole('listbox');
  await expect(panel).toBeVisible();
  await panel.getByPlaceholder('Ex.: ITSA4').fill(ticker);
  await panel.getByRole('option').filter({ hasText: ticker }).first().click();
}
