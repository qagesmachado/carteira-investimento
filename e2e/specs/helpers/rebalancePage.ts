import { expect, type Locator, type Page } from '@playwright/test';

async function fillBrDecimalTestInput(page: Page, testId: string, value: string): Promise<void> {
  const input = page.getByTestId(testId);
  await input.click();
  await input.fill(value);
  await input.dispatchEvent('input');
  await input.blur();
}

export async function gotoRebalancePage(page: Page): Promise<void> {
  await page.goto('/rebalanceamento');
  await expect(page.getByRole('heading', { name: 'Rebalanceamento', exact: true })).toBeVisible();
}

export function assetRebalanceTableSection(page: Page): Locator {
  return page.getByTestId('rebalance-asset-section');
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

export async function setRebalanceAllocationSlider(
  page: Page,
  classKey: string,
  value: number
): Promise<void> {
  const slider = page.getByTestId(`custom-allocation-slider-${classKey}`);
  await slider.evaluate((element, nextValue) => {
    const input = element as HTMLInputElement;
    input.value = String(nextValue);
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }, value);
}

export async function saveRebalanceConfig(page: Page): Promise<void> {
  await page.getByTestId('rebalance-config-save').click();
}

export async function openRebalanceProfilePresetModal(page: Page): Promise<void> {
  await page.getByTestId('rebalance-config-apply-preset').click();
  await expect(page.getByTestId('rebalance-profile-preset-modal')).toBeVisible();
}

export async function applyRebalanceProfilePreset(
  page: Page,
  profileId: 'conservative' | 'moderate' | 'bold'
): Promise<void> {
  await openRebalanceProfilePresetModal(page);
  await page.getByTestId(`rebalance-profile-preset-${profileId}`).click();
  await page.getByTestId('rebalance-profile-preset-apply').click();
  await expect(page.getByTestId('rebalance-profile-preset-modal')).toBeHidden();
}

export function balanceamentoTableSection(page: Page): Locator {
  return page.getByTestId('rebalance-class-section');
}

export function simulationPanel(page: Page): Locator {
  return page.getByTestId('rebalance-simulation-panel');
}

export async function setSimulationMode(
  page: Page,
  mode: 'total' | 'invest'
): Promise<void> {
  const testId =
    mode === 'total' ? 'rebalance-simulation-mode-total' : 'rebalance-simulation-mode-invest';
  await page.getByTestId(testId).click();
}

export async function fillSimulationAmount(page: Page, amount: string): Promise<void> {
  await fillBrDecimalTestInput(page, 'rebalance-simulation-amount', amount);
}

export async function fillInvestmentAmount(page: Page, amount: string): Promise<void> {
  await setSimulationMode(page, 'invest');
  await fillSimulationAmount(page, amount);
}

export async function fillFinalPatrimonyAmount(page: Page, amount: string): Promise<void> {
  await setSimulationMode(page, 'total');
  await fillSimulationAmount(page, amount);
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
