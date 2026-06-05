import { expect, type Page } from '@playwright/test';

export const HIDE_MONEY_STORAGE_KEY = 'carteira.hideMoneyValues';

export const TOP_LEVEL_MENU_ORDER = [
  'Dashboard',
  'Visão consolidada',
  'Alocação',
  'Cadastro',
  'Ferramentas'
] as const;

function topLevelMenuItem(page: Page, label: string) {
  return page.locator('header').getByRole(label === 'Dashboard' || label === 'Visão consolidada' ? 'link' : 'button', {
    name: label,
    exact: true
  });
}

export async function expectTopLevelMenuOrder(page: Page): Promise<void> {
  const xs: number[] = [];
  for (const label of TOP_LEVEL_MENU_ORDER) {
    const item = topLevelMenuItem(page, label);
    await expect(item).toBeVisible();
    const box = await item.boundingBox();
    if (!box) throw new Error(`Sem boundingBox para o menu "${label}"`);
    xs.push(box.x);
  }
  const sorted = [...xs].sort((a, b) => a - b);
  expect(xs).toEqual(sorted);
}

export async function openNavMenu(page: Page, label: string): Promise<void> {
  await page.locator('header').getByRole('button', { name: label, exact: true }).click();
}

export function hideMoneyToggle(page: Page) {
  return page.getByTestId('toggle-hide-money-btn');
}

export async function clickHideMoneyToggle(page: Page): Promise<void> {
  await hideMoneyToggle(page).click();
}

export async function expectMoneyValuesHidden(page: Page): Promise<void> {
  await expect(page.getByText('R$ ••••••').first()).toBeVisible();
}

export async function expectMoneyValuesVisible(page: Page): Promise<void> {
  await expect(page.getByText('R$ ••••••')).toHaveCount(0);
  const patrimonySection = page.getByText('Patrimônio total').locator('..');
  await expect(patrimonySection).toBeVisible();
  await expect(patrimonySection).not.toContainText('••••••');
}

export async function expectHideMoneyPreferenceStored(
  page: Page,
  hidden: boolean
): Promise<void> {
  const stored = await page.evaluate((key) => localStorage.getItem(key), HIDE_MONEY_STORAGE_KEY);
  expect(stored).toBe(JSON.stringify(hidden));
}
