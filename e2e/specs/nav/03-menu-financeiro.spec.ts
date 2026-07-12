import { expect, test } from '../fixtures/test';

import { openNavMenu } from '../helpers/navPage';
import { gotoDashboardPage } from '../helpers/dashboardPage';

/** @see ../../casos-de-uso/ui/nav/03-menu-financeiro.md */
test.describe('UI-NAV-003', () => {
  test('dropdown Financeiro abre painel e sub-nav Orçamento', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Financeiro');
    await page.locator('header').getByRole('link', { name: 'Orçamento' }).click();
    await expect(page).toHaveURL(/\/financeiro\/orcamento\//);
    await expect(page.getByTestId('financeiro-orcamento-heading')).toBeVisible();
  });
});
