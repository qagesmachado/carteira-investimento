import { expect, test } from '../fixtures/test';

import {
  addBudgetExpenseFromUi,
  gotoFinanceiroDespesas,
  gotoFinanceiroOrcamento
} from '../helpers/financeiroPage';
import { currentBudgetYearMonth, getMonthSnapshotViaApi, seedBudgetProfile } from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/10-despesas-crud.md */
test.describe('UI-FIN-010', () => {
  test.beforeEach(async ({ request }) => {
    await seedBudgetProfile(request);
  });

  test('cadastra, edita e exclui despesa na aba Despesas', async ({ page, request }) => {
    const yearMonth = currentBudgetYearMonth();
    await gotoFinanceiroDespesas(page, yearMonth);

    await addBudgetExpenseFromUi(page, {
      description: 'Supermercado',
      amount: '250',
      categoryName: 'Custos fixos'
    });
    await expect(page.getByTestId('budget-resumo-despesas')).toHaveText('R$ 250,00');
    await expect(page.getByTestId('budget-expense-list')).toContainText('Supermercado');

    await page.getByTestId('budget-expense-list').locator('summary').click();
    await page.getByRole('button', { name: 'Editar' }).click();
    await expect(page.getByTestId('budget-expense-edit-modal')).toBeVisible();
    await page.getByTestId('budget-expense-edit-description').fill('Supermercado semanal');
    await page.getByTestId('budget-expense-edit-save').click();
    await expect(page.getByTestId('budget-expense-edit-modal')).toHaveCount(0);
    await expect(page.getByTestId('budget-expense-list')).toContainText('Supermercado semanal');

    const profileId = Number(await page.getByTestId('budget-profile-select').inputValue());
    const snapshot = await getMonthSnapshotViaApi(request, profileId, yearMonth);
    const expenseId = snapshot.transactions.find((tx) => tx.description === 'Supermercado semanal')?.id;
    expect(expenseId).toBeTruthy();

    await page.getByTestId(`budget-expense-delete-${expenseId}`).click();
    await expect(page.getByTestId('budget-expense-delete-confirm-modal')).toBeVisible();
    await page.getByTestId('budget-expense-delete-confirm').click();
    await expect(page.getByTestId('budget-expense-list')).not.toContainText('Supermercado semanal');

    await gotoFinanceiroOrcamento(page, yearMonth);
    await expect(page.getByText('Supermercado semanal')).toHaveCount(0);
  });
});
