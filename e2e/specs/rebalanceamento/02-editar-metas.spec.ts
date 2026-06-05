import { expect, test } from '../fixtures/test';


import { gotoRebalanceConfigPage, gotoRebalancePage } from '../helpers/rebalancePage';
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
    await page.locator('#class-stocks').fill('25');
    await page.locator('#class-funds').fill('10');
    await page.locator('#class-international').fill('15');
    await page.locator('#class-fixed_income').fill('45');
    await page.locator('#class-crypto').fill('5');
    await page.getByRole('button', { name: 'Salvar metas' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Metas salvas.' })).toBeVisible();

    await gotoRebalancePage(page);
    const table = page.locator('section').filter({ hasText: 'Balanceamento desejado' });
    await expect(table.getByRole('row').filter({ hasText: 'Ações/ETF BR' })).toContainText('25,00%');
    await expect(table.getByRole('row').filter({ hasText: 'Renda fixa' })).toContainText('45,00%');
  });
});
