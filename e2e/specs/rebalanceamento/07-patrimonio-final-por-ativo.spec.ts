import { expect, test } from '../fixtures/test';


import { gotoRebalancePage } from '../helpers/rebalancePage';
import { seedRebalanceTwoStocksScored } from '../helpers/seedRebalance';

/**
 * UI-REB-007 — Projeção por ativo com patrimônio final
 * @see ../../../casos-de-uso/ui/rebalanceamento/07-patrimonio-final-por-ativo.md
 */
test.describe('UI-REB-007', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceTwoStocksScored(request);
  });

  test('exibe faltando projetado por ativo ao informar patrimônio final', async ({ page }) => {
    await gotoRebalancePage(page);

    const classTable = page.locator('section').filter({ hasText: 'Balanceamento desejado' });
    await classTable.getByLabel('Patrimônio final').fill('150000');
    await classTable.getByLabel('Patrimônio final').blur();

    const assetsSection = page.locator('section').filter({ hasText: 'Por ativo' });
    const aaaRow = assetsSection.getByRole('row').filter({ hasText: 'AAA3' });
    await expect(aaaRow).toBeVisible();
    await expect(aaaRow.locator('td').last()).not.toHaveText('—');
    await expect(aaaRow.locator('td').last()).toHaveText(/R\$/);
  });
});
