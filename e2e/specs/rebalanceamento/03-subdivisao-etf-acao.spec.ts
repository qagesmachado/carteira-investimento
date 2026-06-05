import { expect, test } from '../fixtures/test';


import { gotoRebalancePage } from '../helpers/rebalancePage';
import { seedRebalanceWithMix } from '../helpers/seedRebalance';

/**
 * UI-REB-003 — Sub-divisão ETF/Ação visível
 * @see ../../../casos-de-uso/ui/rebalanceamento/03-subdivisao-etf-acao.md
 */
test.describe('UI-REB-003', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceWithMix(request);
  });

  test('exibe bloco relação ETF e Ação', async ({ page }) => {
    await gotoRebalancePage(page);
    await expect(page.getByRole('heading', { name: 'Relação ETF / Ação' })).toBeVisible();
    const block = page.locator('section').filter({ hasText: 'Relação ETF / Ação' });
    await expect(block.getByRole('row').filter({ hasText: 'ETF' })).toContainText('70,00%');
    await expect(block.getByRole('row').filter({ hasText: 'Ação' })).toContainText('30,00%');
  });
});
