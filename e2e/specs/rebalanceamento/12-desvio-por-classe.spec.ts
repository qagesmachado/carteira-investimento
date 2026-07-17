import { expect, test } from '../fixtures/test';

import { balanceamentoTableSection, gotoRebalancePage } from '../helpers/rebalancePage';
import { seedRebalanceWithMix } from '../helpers/seedRebalance';

/**
 * UI-REB-012 — Desvio por classe (% e R$)
 * @see ../../../casos-de-uso/ui/rebalanceamento/12-desvio-por-classe.md
 */
test.describe('UI-REB-012', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceWithMix(request);
  });

  test('exibe meta, atual e desvios na tabela por classe', async ({ page }) => {
    await gotoRebalancePage(page);

    const table = balanceamentoTableSection(page);
    await expect(table.getByRole('columnheader', { name: 'Meta %' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: '% Atual' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Desvio %' })).toBeVisible();
    await expect(table.getByRole('columnheader', { name: 'Desvio R$' })).toBeVisible();

    const stocksRow = table.getByRole('row').filter({ hasText: 'Ações/ETF BR' });
    await expect(stocksRow).toContainText('30,00%');
    await expect(stocksRow.locator('td').nth(4)).toHaveText(/%$/);

    await expect(page.getByTestId('rebalance-kpi-above-target')).toBeVisible();
    await expect(page.getByTestId('rebalance-kpi-below-target')).toBeVisible();
  });
});
