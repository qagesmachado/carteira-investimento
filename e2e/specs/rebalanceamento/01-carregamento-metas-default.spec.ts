import { expect, test } from '../fixtures/test';


import {
  expectRebalanceClassRow,
  gotoRebalancePage
} from '../helpers/rebalancePage';
import { seedRebalanceEmpty } from '../helpers/seedRebalance';

/**
 * UI-REB-001 — Carregamento rebalanceamento com metas default
 * @see ../../../casos-de-uso/ui/rebalanceamento/01-carregamento-metas-default.md
 */
test.describe('UI-REB-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceEmpty(request);
  });

  test('exibe tabela de balanceamento com metas padrão', async ({ page }) => {
    await gotoRebalancePage(page);
    await expect(page.getByRole('heading', { name: 'Balanceamento desejado' })).toBeVisible();
    await expectRebalanceClassRow(page, 'Ações/ETF BR', '30,00%');
    await expectRebalanceClassRow(page, 'Renda fixa', '40,00%');
    await expect(page.getByRole('row', { name: /TOTAL/ })).toBeVisible();
  });
});
