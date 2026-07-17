import { expect, test } from '../fixtures/test';

import { gotoRebalanceConfigPage, gotoRebalancePage, saveRebalanceConfig, setRebalanceAllocationSlider } from '../helpers/rebalancePage';
import { seedRebalanceEmpty } from '../helpers/seedRebalance';

/**
 * UI-REB-013 — Visibilidade por meta mínima (≥ 1%)
 * @see ../../../casos-de-uso/ui/rebalanceamento/13-visibilidade-meta-minima.md
 */
test.describe('UI-REB-013', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceEmpty(request);
  });

  test('oculta classes e abas com meta abaixo de 1%', async ({ page }) => {
    await gotoRebalanceConfigPage(page);
    await setRebalanceAllocationSlider(page, 'stocks', 35);
    await setRebalanceAllocationSlider(page, 'funds', 0);
    await setRebalanceAllocationSlider(page, 'international', 25);
    await setRebalanceAllocationSlider(page, 'fixed_income', 40);
    await setRebalanceAllocationSlider(page, 'crypto', 0);
    await saveRebalanceConfig(page);
    await expect(page.getByRole('alert').filter({ hasText: 'Metas salvas.' })).toBeVisible();

    await gotoRebalancePage(page);
    const classSection = page.getByTestId('rebalance-class-section');
    await expect(classSection.getByRole('row').filter({ hasText: 'Ações/ETF BR' })).toBeVisible();
    await expect(classSection.getByRole('row').filter({ hasText: 'Internacional' })).toBeVisible();
    await expect(classSection.getByRole('row').filter({ hasText: 'Renda fixa' })).toBeVisible();
    await expect(classSection.getByRole('row').filter({ hasText: 'Fundos' })).toHaveCount(0);
    await expect(classSection.getByRole('row').filter({ hasText: 'Criptomoeda' })).toHaveCount(0);

    const assetSection = page.getByTestId('rebalance-asset-section');
    await expect(assetSection.getByRole('tab', { name: 'Ações/ETF BR' })).toBeVisible();
    await expect(assetSection.getByRole('tab', { name: 'ETF internacional' })).toBeVisible();
    await expect(assetSection.getByRole('tab', { name: 'FII' })).toHaveCount(0);
    await expect(assetSection.getByRole('tab', { name: 'Criptomoedas' })).toHaveCount(0);
  });
});
