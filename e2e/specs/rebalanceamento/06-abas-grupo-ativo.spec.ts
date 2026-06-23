import { expect, test } from '../fixtures/test';


import { gotoRebalancePage } from '../helpers/rebalancePage';
import { seedRebalanceWithMix } from '../helpers/seedRebalance';

/**
 * UI-REB-006 — Abas por grupo de ativo
 * @see ../../../casos-de-uso/ui/rebalanceamento/06-abas-grupo-ativo.md
 */
test.describe('UI-REB-006', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceWithMix(request);
  });

  test('alterna abas Ações/ETF BR, ETF internacional, FII e Criptomoedas', async ({ page }) => {
    await gotoRebalancePage(page);
    const section = page.locator('section').filter({ hasText: 'Por ativo' });
    await expect(section.getByRole('tab', { name: 'Ações/ETF BR' })).toBeVisible();
    await expect(section.getByRole('tab', { name: 'ETF internacional' })).toBeVisible();
    await expect(section.getByRole('tab', { name: 'FII' })).toBeVisible();
    await expect(section.getByRole('tab', { name: 'Criptomoedas' })).toBeVisible();

    await section.getByRole('tab', { name: 'ETF internacional' }).click();
    await expect(section.getByRole('tab', { name: 'ETF internacional' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});
