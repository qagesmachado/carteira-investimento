import { expect, test } from '../fixtures/test';



import { fillBrDecimalTestInput, gotoFinanceiroDespesas } from '../helpers/financeiroPage';

import {

  currentBudgetYearMonth,

  getMonthSnapshotViaApi,

  seedBudgetProfile,

  shiftBudgetYearMonth

} from '../helpers/seedBudget';



/** @see ../../casos-de-uso/ui/financeiro/11-despesas-recorrentes.md */

test.describe('UI-FIN-011', () => {

  test.beforeEach(async ({ request }) => {

    await seedBudgetProfile(request);

  });



  test('cadastra despesa recorrente indeterminada e aparece nas três tabelas', async ({ page }) => {

    const yearMonth = currentBudgetYearMonth();

    await gotoFinanceiroDespesas(page, yearMonth);



    await page.getByTestId('budget-expense-description').fill('Aluguel');

    await fillBrDecimalTestInput(page, 'budget-expense-amount', '1500');

    await page.getByTestId('budget-expense-recurring').check();

    await page.getByTestId('budget-expense-end-indefinite').check();

    await page.getByTestId('budget-expense-save').click();



    await expect(page.getByTestId('budget-resumo-despesas')).toHaveText('R$ 1.500,00');

    await expect(page.getByTestId('budget-expense-list')).toContainText('Aluguel');

    await expect(page.getByTestId('budget-expense-list-recurring')).toContainText('Aluguel');

    await expect(page.getByTestId('budget-expense-list-recurring')).toContainText('Indeterminado');

  });



  test('cadastra despesa recorrente com fim e materializa no mês seguinte', async ({ page, request }) => {

    const yearMonth = currentBudgetYearMonth();

    await gotoFinanceiroDespesas(page, yearMonth);



    await page.getByTestId('budget-expense-description').fill('Academia');

    await fillBrDecimalTestInput(page, 'budget-expense-amount', '120');

    await page.getByTestId('budget-expense-recurring').check();

    await page.getByTestId('budget-expense-end-until').check();

    const endMonth = `${yearMonth.slice(0, 4)}-12`;

    await page.getByTestId('budget-expense-end-month-month').selectOption('12');

    await page.getByTestId('budget-expense-end-month-year').fill(yearMonth.slice(0, 4));

    await page.getByTestId('budget-expense-save').click();



    await expect(page.getByTestId('budget-expense-list-recurring')).toContainText(

      'dezembro/' + yearMonth.slice(0, 4)

    );



    const profileId = Number(await page.getByTestId('budget-profile-select').inputValue());

    const nextMonth = shiftBudgetYearMonth(yearMonth, 1);

    const snapshot = await getMonthSnapshotViaApi(request, profileId, nextMonth);

    expect(snapshot.transactions.some((tx: { description: string }) => tx.description === 'Academia')).toBe(true);

  });

});


