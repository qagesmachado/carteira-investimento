import { expect, test } from '../fixtures/test';

import {
  gotoRebalanceConfigPage,
  gotoRebalancePage,
  saveRebalanceConfig,
  setRebalanceAllocationSlider
} from '../helpers/rebalancePage';
import { seedRebalanceEmpty } from '../helpers/seedRebalance';

/**
 * UI-REB-002 — Editar metas e refletir na tabela
 * @see ../../../casos-de-uso/ui/rebalanceamento/02-editar-metas.md
 */
test.describe('UI-REB-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceEmpty(request);
  });

  test('salva novas metas e exibe na tabela principal', async ({ page }) => {
    await gotoRebalanceConfigPage(page);
    await setRebalanceAllocationSlider(page, 'stocks', 25);
    await setRebalanceAllocationSlider(page, 'funds', 10);
    await setRebalanceAllocationSlider(page, 'international', 15);
    await setRebalanceAllocationSlider(page, 'fixed_income', 45);
    await setRebalanceAllocationSlider(page, 'crypto', 5);
    await saveRebalanceConfig(page);
    await expect(page.getByRole('alert').filter({ hasText: 'Metas salvas.' })).toBeVisible();

    await gotoRebalancePage(page);
    const table = page.getByTestId('rebalance-class-section');
    await expect(table.getByRole('row').filter({ hasText: 'Ações/ETF BR' })).toContainText('25,00%');
    await expect(table.getByRole('row').filter({ hasText: 'Renda fixa' })).toContainText('45,00%');
  });
});
