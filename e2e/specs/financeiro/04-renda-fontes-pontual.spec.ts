import { expect, test } from '../fixtures/test';

import {
  fillBrDecimalTestInput,
  gotoFinanceiroRenda
} from '../helpers/financeiroPage';
import { currentBudgetYearMonth, getMonthSnapshotViaApi, seedBudgetProfile, shiftBudgetYearMonth } from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/04-renda-fontes-pontual.md */
test.describe('UI-FIN-004', () => {
  test.beforeEach(async ({ request }) => {
    await seedBudgetProfile(request);
  });

  test('cadastra renda recorrente e pontual em formulário e tabela', async ({ page, request }) => {
    const yearMonth = currentBudgetYearMonth();
    await gotoFinanceiroRenda(page, yearMonth);

    await page.getByTestId('budget-income-name').fill('Salário CLT');
    await fillBrDecimalTestInput(page, 'budget-income-amount', '5000');
    await page.getByTestId('budget-income-recurring').check();
    await page.getByTestId('budget-income-save').click();
    await expect(page.getByTestId('budget-income-total')).toHaveText('Total do mês: R$ 5.000,00');
    await expect(page.getByTestId('budget-income-list')).toContainText('Salário CLT');
    await expect(page.getByTestId('budget-income-list').getByRole('cell', { name: 'Recorrente' })).toBeVisible();

    await page.getByTestId('budget-income-name').fill('Freelance');
    await fillBrDecimalTestInput(page, 'budget-income-amount', '1500');
    await page.getByTestId('budget-income-save').click();
    await expect(page.getByTestId('budget-income-total')).toHaveText('Total do mês: R$ 6.500,00');
    await expect(page.getByTestId('budget-income-list').getByRole('cell', { name: 'Pontual' })).toBeVisible();

    await page.getByRole('button', { name: 'Editar' }).first().click();
    await expect(page.getByTestId('budget-income-edit-modal')).toBeVisible();
    await page.getByTestId('budget-income-edit-name').fill('Salário CLT atualizado');
    await fillBrDecimalTestInput(page, 'budget-income-edit-amount', '5500');
    await page.getByTestId('budget-income-edit-save').click();
    await expect(page.getByTestId('budget-income-edit-modal')).toHaveCount(0);
    await expect(page.getByTestId('budget-income-list')).toContainText('Salário CLT atualizado');
    await expect(page.getByTestId('budget-income-total')).toHaveText('Total do mês: R$ 7.000,00');

    const profileId = Number(await page.getByTestId('budget-profile-select').inputValue());
    const nextMonth = shiftBudgetYearMonth(yearMonth, 1);
    const nextMonthSnapshot = await getMonthSnapshotViaApi(request, profileId, nextMonth);
    expect(nextMonthSnapshot.income_total_brl).toBe(5500);
  });
});
