import { expect, test } from '../fixtures/test';


import { gotoRebalancePage } from '../helpers/rebalancePage';
import { seedRebalanceTwoFiisScored } from '../helpers/seedRebalance';

/**
 * UI-REB-008 — % desejada por FII proporcional ao score
 * @see ../../../casos-de-uso/ui/rebalanceamento/08-percentual-desejado-fii.md
 */
test.describe('UI-REB-008', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceTwoFiisScored(request);
  });

  test('distribui percentual desejado entre FIIs conforme Soma', async ({ page }) => {
    await gotoRebalancePage(page);
    const section = page.locator('section').filter({ hasText: 'Por ativo' });
    await section.getByRole('tab', { name: 'FII' }).click();

    const hglgRow = section.getByRole('row').filter({ hasText: 'HGLG11' });
    const xplgRow = section.getByRole('row').filter({ hasText: 'XPLG11' });
    await expect(hglgRow).toBeVisible();
    await expect(xplgRow).toBeVisible();
    await expect(hglgRow.getByRole('cell').nth(4)).not.toHaveText('—');
    await expect(xplgRow.getByRole('cell').nth(4)).not.toHaveText('—');
    await expect(hglgRow.getByRole('cell').nth(5)).not.toHaveText('—', { timeout: 10_000 });
    await expect(xplgRow.getByRole('cell').nth(5)).not.toHaveText('—', { timeout: 10_000 });

    const hglgPctText = await hglgRow.getByRole('cell').nth(5).innerText();
    const xplgPctText = await xplgRow.getByRole('cell').nth(5).innerText();
    expect(hglgPctText).toMatch(/%$/);
    expect(xplgPctText).toMatch(/%$/);
    const hglgPct = parseFloat(hglgPctText.replace('%', '').replace(/\./g, '').replace(',', '.'));
    const xplgPct = parseFloat(xplgPctText.replace('%', '').replace(/\./g, '').replace(',', '.'));
    expect(Number.isFinite(hglgPct)).toBeTruthy();
    expect(Number.isFinite(xplgPct)).toBeTruthy();
    expect(hglgPct).toBeGreaterThan(xplgPct);
  });
});
