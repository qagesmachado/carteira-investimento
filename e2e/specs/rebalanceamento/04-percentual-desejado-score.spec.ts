import { expect, test } from '../fixtures/test';


import { gotoRebalancePage } from '../helpers/rebalancePage';
import { seedRebalanceTwoStocksScored } from '../helpers/seedRebalance';

/**
 * UI-REB-004 — % desejada por ativo proporcional ao score
 * @see ../../../casos-de-uso/ui/rebalanceamento/04-percentual-desejado-score.md
 */
test.describe('UI-REB-004', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceTwoStocksScored(request);
  });

  test('distribui percentual desejado entre ações conforme Soma', async ({ page }) => {
    const rebalanceResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        /\/portfolios\/\d+\/rebalance$/.test(response.url()) &&
        response.ok()
    );
    await gotoRebalancePage(page);
    await rebalanceResponse;

    const assetsTable = page.locator('section').filter({ hasText: 'Por ativo' });
    const aaaRow = assetsTable.getByRole('row').filter({ hasText: 'AAA3' });
    const bbbRow = assetsTable.getByRole('row').filter({ hasText: 'BBB3' });
    await expect(aaaRow).toBeVisible();
    await expect(bbbRow).toBeVisible();
    await expect(aaaRow.getByRole('cell').nth(4)).not.toHaveText('—');
    await expect(bbbRow.getByRole('cell').nth(4)).not.toHaveText('—');

    const aaaPctText = await aaaRow.getByRole('cell').nth(5).innerText();
    const bbbPctText = await bbbRow.getByRole('cell').nth(5).innerText();
    expect(aaaPctText).toMatch(/%$/);
    expect(bbbPctText).toMatch(/%$/);
    const aaaPct = parseFloat(aaaPctText.replace('%', '').replace(/\./g, '').replace(',', '.'));
    const bbbPct = parseFloat(bbbPctText.replace('%', '').replace(/\./g, '').replace(',', '.'));
    expect(Number.isFinite(aaaPct)).toBeTruthy();
    expect(Number.isFinite(bbbPct)).toBeTruthy();
    expect(aaaPct).toBeGreaterThan(bbbPct);
  });
});
