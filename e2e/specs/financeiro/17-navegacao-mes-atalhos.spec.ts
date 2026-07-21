import { expect, test } from '../fixtures/test';

import { gotoFinanceiroDespesas } from '../helpers/financeiroPage';
import {
  currentBudgetYearMonth,
  seedBudgetProfile,
  shiftBudgetYearMonth
} from '../helpers/seedBudget';

const MONTH_NAMES = [
  'janeiro',
  'fevereiro',
  'março',
  'abril',
  'maio',
  'junho',
  'julho',
  'agosto',
  'setembro',
  'outubro',
  'novembro',
  'dezembro'
];

function monthLabel(yearMonth: string): string {
  const [year, month] = yearMonth.split('-');
  return `${MONTH_NAMES[Number(month) - 1]}/${year}`;
}

/** @see ../../casos-de-uso/ui/financeiro/17-navegacao-mes-atalhos.md */
test.describe('UI-FIN-017', () => {
  test('navega com "Mês atual" e seletor direto de mês', async ({ page, request }) => {
    await seedBudgetProfile(request);
    const thisMonth = currentBudgetYearMonth();
    const prevMonth = shiftBudgetYearMonth(thisMonth, -1);
    const farMonth = shiftBudgetYearMonth(thisMonth, -5);

    await gotoFinanceiroDespesas(page, thisMonth);

    const label = page.getByTestId('budget-month-label');
    const todayButton = page.getByTestId('budget-month-today');
    const picker = page.getByTestId('budget-month-picker');

    await expect(label).toHaveText(monthLabel(thisMonth));
    await expect(todayButton).toBeDisabled();

    await page.getByRole('button', { name: 'Mês anterior' }).click();
    await expect(label).toHaveText(monthLabel(prevMonth));
    await expect(page).toHaveURL(new RegExp(`/financeiro/despesas/${prevMonth}$`));
    await expect(todayButton).toBeEnabled();

    await todayButton.click();
    await expect(label).toHaveText(monthLabel(thisMonth));
    await expect(page).toHaveURL(new RegExp(`/financeiro/despesas/${thisMonth}$`));
    await expect(todayButton).toBeDisabled();

    await picker.fill(farMonth);
    await expect(label).toHaveText(monthLabel(farMonth));
    await expect(page).toHaveURL(new RegExp(`/financeiro/despesas/${farMonth}$`));
    await expect(todayButton).toBeEnabled();
  });
});
