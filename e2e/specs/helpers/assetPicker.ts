import { expect, type Locator, type Page } from '@playwright/test';

const PICKER_TIMEOUT_MS = 15_000;

/** Painel do AssetPicker é renderizado via portal (body ou dialog). */
export async function pickAssetViaTrigger(
  page: Page,
  trigger: Locator,
  ticker: string
): Promise<void> {
  await trigger.scrollIntoViewIfNeeded();
  await trigger.click();
  const panel = page.getByRole('listbox');
  await expect(panel).toBeVisible({ timeout: PICKER_TIMEOUT_MS });
  await panel.scrollIntoViewIfNeeded();

  const search = panel.getByPlaceholder('Ex.: ITSA4');
  await search.fill(ticker);

  const option = panel.getByRole('option').filter({ hasText: ticker }).first();
  await expect(option).toBeVisible({ timeout: PICKER_TIMEOUT_MS });
  await option.scrollIntoViewIfNeeded();

  try {
    await option.click({ timeout: 5_000 });
  } catch {
    // Lista com scroll interno: teclado costuma ser mais estável que click fora da viewport.
    await search.press('ArrowDown');
    await page.keyboard.press('Enter');
  }

  await expect(panel).toBeHidden({ timeout: PICKER_TIMEOUT_MS });
}
