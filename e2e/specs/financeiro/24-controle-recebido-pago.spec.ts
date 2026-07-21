import { expect, test } from '../fixtures/test';

import { gotoFinanceiroControle } from '../helpers/financeiroPage';
import {
  createBudgetIncomeViaApi,
  createBudgetMonthExpenseViaApi,
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/24-controle-recebido-pago.md */
test.describe('UI-FIN-024', () => {
  test('lista só recorrentes e persiste recebido/pago', async ({ page, request }) => {
    const profile = await seedBudgetProfile(request);
    const yearMonth = currentBudgetYearMonth();
    const snapshot = await getMonthSnapshotViaApi(request, profile.id, yearMonth);
    const categoryId = snapshot.categories[0].category_id as number;

    const incomeSnap = await createBudgetIncomeViaApi(request, profile.id, yearMonth, {
      label: 'Cliente Alpha',
      amount_brl: 4000,
      recurring_12_months: true
    });
    await createBudgetIncomeViaApi(request, profile.id, yearMonth, {
      label: 'Bônus pontual',
      amount_brl: 500,
      recurring_12_months: false
    });
    const expenseSnap = await createBudgetMonthExpenseViaApi(request, profile.id, yearMonth, {
      description: 'Aluguel',
      amount_brl: 1500,
      category_id: categoryId,
      recurring: true,
      indefinite: true
    });
    await createBudgetMonthExpenseViaApi(request, profile.id, yearMonth, {
      description: 'Farmácia',
      amount_brl: 80,
      category_id: categoryId,
      recurring: false
    });

    const incomeId = incomeSnap.incomes.find(
      (item: { label: string }) => item.label === 'Cliente Alpha'
    )?.id as number;
    const expenseId = expenseSnap.transactions.find(
      (item: { description: string }) => item.description === 'Aluguel'
    )?.id as number;

    await gotoFinanceiroControle(page, yearMonth);

    await expect(page.getByTestId('budget-settlement-income-list')).toContainText('Cliente Alpha');
    await expect(page.getByTestId('budget-settlement-income-list')).not.toContainText(
      'Bônus pontual'
    );
    await expect(page.getByTestId('budget-settlement-expense-list')).toContainText('Aluguel');
    await expect(page.getByTestId('budget-settlement-expense-list')).not.toContainText('Farmácia');
    await expect(page.getByTestId('budget-settlement-header-summary')).toContainText(
      '0 de 1 recebidos'
    );
    await expect(page.getByTestId('budget-settlement-header-summary')).toContainText('0 de 1 pagos');

    await page.getByTestId(`budget-settlement-income-toggle-${incomeId}`).check();
    await page.getByTestId(`budget-settlement-expense-toggle-${expenseId}`).check();
    await expect(page.getByTestId('budget-settlement-header-summary')).toContainText(
      '1 de 1 recebidos'
    );
    await expect(page.getByTestId('budget-settlement-header-summary')).toContainText('1 de 1 pagos');

    await page.reload();
    await expect(page.getByTestId('financeiro-controle-heading')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId(`budget-settlement-income-toggle-${incomeId}`)).toBeChecked();
    await expect(page.getByTestId(`budget-settlement-expense-toggle-${expenseId}`)).toBeChecked();

    await page.getByTestId(`budget-settlement-income-toggle-${incomeId}`).uncheck();
    await page.getByTestId(`budget-settlement-expense-toggle-${expenseId}`).uncheck();
    await expect(page.getByTestId('budget-settlement-header-summary')).toContainText(
      '0 de 1 recebidos'
    );
    await expect(page.getByTestId('budget-settlement-header-summary')).toContainText('0 de 1 pagos');

    const full = await getMonthSnapshotViaApi(request, profile.id, yearMonth);
    expect(full.income_total_brl).toBe(4500);
    expect(full.expense_total_brl).toBe(1580);
  });
});
