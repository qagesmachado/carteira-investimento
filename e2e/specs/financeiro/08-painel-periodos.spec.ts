import { expect, test } from '../fixtures/test';

import { gotoFinanceiroPainel, hoverBudgetDonutSlice } from '../helpers/financeiroPage';
import {
  createBudgetExpenseViaApi,
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile,
  shiftBudgetYearMonth,
  updateBudgetIncomesViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/08-painel-periodos.md */
test.describe('UI-FIN-008', () => {
  test('alterna 3M/6M e intervalo personalizado no histórico', async ({ page, request }) => {
    const profile = await seedBudgetProfile(request);
    const yearMonth = currentBudgetYearMonth();
    await updateBudgetIncomesViaApi(request, profile.id, yearMonth, [
      { label: 'Salário', amount_brl: 3000 }
    ]);
    const snapshot = await getMonthSnapshotViaApi(request, profile.id, yearMonth);
    await createBudgetExpenseViaApi(request, profile.id, yearMonth, {
      description: 'Teste',
      amount_brl: 100,
      category_id: snapshot.categories[0].category_id
    });

    await gotoFinanceiroPainel(page);
    await expect(page.locator('.stat').filter({ hasText: 'Receitas' })).toContainText('R$ 3.000,00', {
      timeout: 15_000
    });
    await expect(page.locator('.stat').filter({ hasText: 'Resultado' })).toContainText('R$ 2.900,00');

    await expect(page.getByTestId('budget-dashboard-months-3')).toHaveClass(/btn-primary/);
    await expect(page.getByTestId('budget-cashflow-chart')).toBeVisible();
    await expect(page.locator('[data-testid^="budget-cashflow-month-"]')).toHaveCount(7);
    await expect(page.getByTestId(`budget-cashflow-month-${shiftBudgetYearMonth(yearMonth, -3)}`)).toBeVisible();
    await expect(page.getByTestId(`budget-cashflow-month-${shiftBudgetYearMonth(yearMonth, 3)}`)).toBeVisible();

    await page.getByTestId('budget-dashboard-months-6').click();
    await expect(page.locator('[data-testid^="budget-cashflow-month-"]')).toHaveCount(13);

    const monthColumn = page.getByTestId(`budget-cashflow-month-${yearMonth}`);
    await monthColumn.scrollIntoViewIfNeeded();
    await monthColumn.focus();
    await expect(page.getByTestId('budget-cashflow-tooltip')).toContainText('Receita:');

    const fromYm = shiftBudgetYearMonth(yearMonth, -1);
    const toYm = shiftBudgetYearMonth(yearMonth, 1);
    const [fromYear, fromMonth] = fromYm.split('-');
    const [toYear, toMonth] = toYm.split('-');

    await page.getByTestId('budget-dashboard-months-custom').click();
    await expect(page.getByTestId('budget-dashboard-custom-range')).toBeVisible();
    await expect(page.getByText('Mês inicial')).toBeVisible();
    await expect(page.getByText('Mês final')).toBeVisible();

    await page.getByTestId('budget-dashboard-from-month').selectOption(fromMonth!);
    await page.getByTestId('budget-dashboard-from-year').fill(fromYear!);
    await page.getByTestId('budget-dashboard-to-month').selectOption(toMonth!);
    await page.getByTestId('budget-dashboard-to-year').fill(toYear!);

    await expect(page.locator('[data-testid^="budget-cashflow-month-"]')).toHaveCount(3);
    await expect(page.getByTestId(`budget-cashflow-month-${fromYm}`)).toBeVisible();
    await expect(page.getByTestId(`budget-cashflow-month-${toYm}`)).toBeVisible();
    await expect(page.getByTestId('budget-dashboard-tags-chart')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Receitas' })).toHaveCount(0);

    await page.getByTestId('budget-dashboard-categories-chart-expand').click();
    await expect(page.getByTestId('budget-dashboard-categories-chart-modal')).toBeVisible();
    await expect(page.getByTestId('budget-dashboard-categories-chart-modal')).toContainText('Despesas por metas');
    await hoverBudgetDonutSlice(page, 'budget-dashboard-categories-chart-modal-pie');
    await expect(page.getByTestId('budget-dashboard-categories-chart-modal-tooltip')).toBeVisible();
    await page.getByTestId('budget-dashboard-categories-chart-modal-close').click();
    await expect(page.getByTestId('budget-dashboard-categories-chart-modal')).toHaveCount(0);

    await hoverBudgetDonutSlice(page, 'budget-dashboard-categories-chart-pie');
    await expect(page.getByTestId('budget-dashboard-categories-chart-tooltip')).toBeVisible();
  });
});
