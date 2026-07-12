import { expect, test } from '../fixtures/test';

import { fillBrDecimalTestInput, gotoFinanceiroDespesas } from '../helpers/financeiroPage';
import {
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile,
  shiftBudgetYearMonth
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/12-parar-recorrente-mes.md */
test.describe('UI-FIN-012', () => {
  test('para recorrência a partir do mês atual e preserva meses anteriores', async ({ page, request }) => {
    await seedBudgetProfile(request);
    const startMonth = shiftBudgetYearMonth(currentBudgetYearMonth(), -2);
    const stopMonth = currentBudgetYearMonth();
    const previousMonth = shiftBudgetYearMonth(stopMonth, -1);

    await gotoFinanceiroDespesas(page, startMonth);
    await page.getByTestId('budget-expense-description').fill('Internet');
    await page.getByTestId('budget-expense-date').fill(`10/${startMonth.slice(5, 7)}/${startMonth.slice(0, 4)}`);
    await fillBrDecimalTestInput(page, 'budget-expense-amount', '150');
    await page.getByTestId('budget-expense-recurring').check();
    await page.getByTestId('budget-expense-end-indefinite').check();
    await page.getByTestId('budget-expense-save').click();

    await gotoFinanceiroDespesas(page, stopMonth);
    await page.getByTestId('budget-expense-list').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByTestId('budget-expense-delete-confirm-modal')).toBeVisible();
    await page.getByTestId('budget-expense-stop-from-month').click();
    await expect(page.getByTestId('budget-expense-delete-confirm-modal')).toHaveCount(0);
    await expect(page.getByTestId('budget-expense-total')).toHaveText('Total de despesas: R$ 0,00');

    const profileId = Number(await page.getByTestId('budget-profile-select').inputValue());
    const startSnapshot = await getMonthSnapshotViaApi(request, profileId, startMonth);
    const previousSnapshot = await getMonthSnapshotViaApi(request, profileId, previousMonth);
    const stopSnapshot = await getMonthSnapshotViaApi(request, profileId, stopMonth);
    expect(startSnapshot.expense_total_brl).toBe(150);
    expect(previousSnapshot.expense_total_brl).toBe(150);
    expect(stopSnapshot.expense_total_brl).toBe(0);
  });
});
