import { expect, test } from '../fixtures/test';

import {
  balanceamentoTableSection,
  fillInvestmentAmount,
  gotoRebalancePage
} from '../helpers/rebalancePage';
import { seedRebalanceWithMix } from '../helpers/seedRebalance';

/**
 * UI-REB-005 — Projeção com valor a investir
 * @see ../../../casos-de-uso/ui/rebalanceamento/05-patrimonio-final-projetado.md
 */
test.describe('UI-REB-005', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceWithMix(request);
  });

  test('recalcula deveria ter e aporte ao informar valor a investir', async ({ page }) => {
    await gotoRebalancePage(page);
    const table = balanceamentoTableSection(page);
    await fillInvestmentAmount(page, '10000');

    await expect(table.getByText(/Patrimônio final:/)).toBeVisible();

    const intlRow = table.getByRole('row').filter({ hasText: 'Internacional' });
    await expect(intlRow.locator('td').nth(5)).not.toHaveText('—');
    await expect(intlRow.locator('td').nth(6)).not.toHaveText('—');
    await expect(table.getByText(/Aporte: R\$/)).toBeVisible();
  });
});
