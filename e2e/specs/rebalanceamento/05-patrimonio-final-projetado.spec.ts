import { expect, test } from '../fixtures/test';


import { gotoRebalancePage } from '../helpers/rebalancePage';
import { seedRebalanceWithMix } from '../helpers/seedRebalance';

/**
 * UI-REB-005 — Projeção com patrimônio final
 * @see ../../../casos-de-uso/ui/rebalanceamento/05-patrimonio-final-projetado.md
 */
test.describe('UI-REB-005', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceWithMix(request);
  });

  test('recalcula faltando ao informar patrimônio final', async ({ page }) => {
    await gotoRebalancePage(page);
    const table = page.locator('section').filter({ hasText: 'Balanceamento desejado' });
    await table.getByLabel('Patrimônio final').fill('150000');
    await table.getByLabel('Patrimônio final').blur();

    const intlRow = table.getByRole('row').filter({ hasText: 'Internacional' });
    await expect(intlRow.locator('td').last()).not.toHaveText('—');
    await expect(table.getByText(/Faltando: R\$/)).toBeVisible();
  });
});
