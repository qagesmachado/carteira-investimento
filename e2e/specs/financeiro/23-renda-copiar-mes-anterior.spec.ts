import { expect, test } from '../fixtures/test';

import { gotoFinanceiroRenda } from '../helpers/financeiroPage';
import {
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile,
  shiftBudgetYearMonth,
  updateBudgetIncomesViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/23-renda-copiar-mes-anterior.md */
test.describe('UI-FIN-023', () => {
  test('exibe diff e só copia após confirmar no modal', async ({ page, request }) => {
    const profile = await seedBudgetProfile(request);
    const yearMonth = currentBudgetYearMonth();
    const previousMonth = shiftBudgetYearMonth(yearMonth, -1);

    await updateBudgetIncomesViaApi(request, profile.id, previousMonth, [
      { label: 'Salário', amount_brl: 5000 }
    ]);
    await updateBudgetIncomesViaApi(request, profile.id, yearMonth, [
      { label: 'Bônus', amount_brl: 800 }
    ]);

    await gotoFinanceiroRenda(page, yearMonth);
    await expect(page.getByTestId('budget-income-list')).toContainText('Bônus');

    await page.getByTestId('budget-copy-previous-incomes').click();
    const modal = page.getByTestId('budget-income-copy-confirm-modal');
    await expect(modal).toBeVisible();
    await expect(page.getByTestId('budget-income-copy-entering')).toContainText('Salário');
    await expect(page.getByTestId('budget-income-copy-entering')).toContainText('R$ 5.000,00');
    await expect(page.getByTestId('budget-income-copy-leaving')).toContainText('Bônus');
    await expect(page.getByTestId('budget-income-copy-leaving')).toContainText('R$ 800,00');

    await page.getByTestId('budget-income-copy-cancel').click();
    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('budget-income-list')).toContainText('Bônus');
    await expect(page.getByTestId('budget-income-total')).toHaveText('Total do mês: R$ 800,00');

    await page.getByTestId('budget-copy-previous-incomes').click();
    await expect(modal).toBeVisible();
    await page.getByTestId('budget-income-copy-confirm').click();
    await expect(modal).toHaveCount(0);
    await expect(page.getByTestId('budget-income-list')).toContainText('Salário');
    await expect(page.getByTestId('budget-income-list')).not.toContainText('Bônus');
    await expect(page.getByTestId('budget-income-total')).toHaveText('Total do mês: R$ 5.000,00');

    const snapshot = await getMonthSnapshotViaApi(request, profile.id, yearMonth);
    expect(snapshot.income_total_brl).toBe(5000);
    expect(snapshot.incomes.map((item: { label: string }) => item.label)).toEqual(['Salário']);
  });
});
