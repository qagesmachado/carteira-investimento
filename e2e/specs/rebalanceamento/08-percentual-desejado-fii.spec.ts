import { expect, test } from '../fixtures/test';

import { assetRebalanceTableSection, gotoRebalancePage } from '../helpers/rebalancePage';
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
    const rebalanceResponsePromise = page.waitForResponse(
      (response) =>
        response.request().method() === 'GET' &&
        /\/portfolios\/\d+\/rebalance$/.test(response.url()) &&
        response.ok()
    );
    await gotoRebalancePage(page);
    const rebalanceResponse = await rebalanceResponsePromise;
    const body = (await rebalanceResponse.json()) as {
      fund_assets: {
        symbol: string;
        sum_score: number | null;
        target_percent: number | null;
      }[];
    };
    const hglgApi = body.fund_assets.find((a) => a.symbol === 'HGLG11');
    const xplgApi = body.fund_assets.find((a) => a.symbol === 'XPLG11');
    expect(hglgApi?.sum_score ?? 0).toBeGreaterThan(0);
    expect(xplgApi?.sum_score ?? 0).toBeGreaterThan(0);
    expect(hglgApi?.target_percent ?? null).not.toBeNull();
    expect(xplgApi?.target_percent ?? null).not.toBeNull();
    expect(hglgApi!.target_percent!).toBeGreaterThan(xplgApi!.target_percent!);

    const section = assetRebalanceTableSection(page);
    await section.getByRole('tab', { name: 'FII' }).click();

    const hglgRow = section.getByRole('row').filter({ hasText: 'HGLG11' });
    const xplgRow = section.getByRole('row').filter({ hasText: 'XPLG11' });
    await expect(hglgRow).toBeVisible();
    await expect(xplgRow).toBeVisible();

    // Colunas com Soma: … | % atual | Soma | % desejada | …
    await expect(hglgRow.getByRole('cell').nth(5)).toHaveText(/%$/);
    await expect(xplgRow.getByRole('cell').nth(5)).toHaveText(/%$/);

    const hglgPctText = await hglgRow.getByRole('cell').nth(5).innerText();
    const xplgPctText = await xplgRow.getByRole('cell').nth(5).innerText();
    const hglgPct = parseFloat(hglgPctText.replace('%', '').replace(/\./g, '').replace(',', '.'));
    const xplgPct = parseFloat(xplgPctText.replace('%', '').replace(/\./g, '').replace(',', '.'));
    expect(hglgPct).toBeGreaterThan(xplgPct);
  });
});
