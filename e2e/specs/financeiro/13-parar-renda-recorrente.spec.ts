import { expect, test } from '../fixtures/test';

import { fillBrDecimalTestInput, gotoFinanceiroRenda } from '../helpers/financeiroPage';
import {
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile,
  shiftBudgetYearMonth
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/13-parar-renda-recorrente.md */
test.describe('UI-FIN-013', () => {
  test('para renda recorrente a partir do mês atual e preserva meses anteriores', async ({
    page,
    request
  }) => {
    await seedBudgetProfile(request);
    const startMonth = shiftBudgetYearMonth(currentBudgetYearMonth(), -2);
    const stopMonth = currentBudgetYearMonth();
    const previousMonth = shiftBudgetYearMonth(stopMonth, -1);

    await gotoFinanceiroRenda(page, startMonth);
    await page.getByTestId('budget-income-name').fill('Salário CLT');
    await fillBrDecimalTestInput(page, 'budget-income-amount', '5000');
    await page.getByTestId('budget-income-recurring').check();
    await page.getByTestId('budget-income-save').click();

    await gotoFinanceiroRenda(page, stopMonth);
    await page.getByTestId('budget-income-list').getByRole('button', { name: 'Excluir' }).click();
    await expect(page.getByTestId('budget-income-delete-confirm-modal')).toBeVisible();
    await page.getByTestId('budget-income-stop-from-month').click();
    await expect(page.getByTestId('budget-income-delete-confirm-modal')).toHaveCount(0);
    await expect(page.getByTestId('budget-income-total')).toHaveText('Total do mês: R$ 0,00');

    const profileId = Number(await page.getByTestId('budget-profile-select').inputValue());
    const startSnapshot = await getMonthSnapshotViaApi(request, profileId, startMonth);
    const previousSnapshot = await getMonthSnapshotViaApi(request, profileId, previousMonth);
    const stopSnapshot = await getMonthSnapshotViaApi(request, profileId, stopMonth);
    expect(startSnapshot.income_total_brl).toBe(5000);
    expect(previousSnapshot.income_total_brl).toBe(5000);
    expect(stopSnapshot.income_total_brl).toBe(0);
  });
});
