import { expect, test } from '../fixtures/test';

import { gotoFinanceiroDespesas } from '../helpers/financeiroPage';
import {
  createBudgetExpenseViaApi,
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile,
  updateBudgetIncomesViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/16-despesas-filtro-ordenacao-paginacao.md */
test.describe('UI-FIN-016', () => {
  test('resume, filtra, ordena e pagina as despesas do mês', async ({ page, request }) => {
    const profile = await seedBudgetProfile(request);
    const yearMonth = currentBudgetYearMonth();
    await updateBudgetIncomesViaApi(request, profile.id, yearMonth, [
      { label: 'Salário', amount_brl: 5000 }
    ]);
    const snapshot = await getMonthSnapshotViaApi(request, profile.id, yearMonth);
    const category = snapshot.categories[0];

    for (let i = 1; i <= 22; i += 1) {
      await createBudgetExpenseViaApi(request, profile.id, yearMonth, {
        description: `Pontual ${String(i).padStart(2, '0')}`,
        amount_brl: 100,
        category_id: category.category_id,
        event_date: `${yearMonth}-${String((i % 28) + 1).padStart(2, '0')}`
      });
    }

    await gotoFinanceiroDespesas(page, yearMonth);

    const resumo = page.getByTestId('budget-despesas-resumo');
    await expect(resumo.getByTestId('budget-resumo-receitas')).toHaveText('R$ 5.000,00');
    await expect(resumo.getByTestId('budget-resumo-despesas')).toHaveText('R$ 2.200,00');
    await expect(resumo.getByTestId('budget-resumo-sobrando')).toHaveText('R$ 2.800,00');

    const list = page.getByTestId('budget-expense-list');
    await list.locator('summary').click();
    const pager = page.getByRole('navigation', {
      name: 'budget-expense-filters paginação',
      exact: true
    });
    await expect(list.locator('tbody tr')).toHaveCount(20);
    await expect(pager).toContainText('de 22');

    await pager.getByRole('button', { name: 'Próxima' }).click();
    await expect(list.locator('tbody tr')).toHaveCount(2);
    await expect(pager.getByRole('button', { name: 'Próxima' })).toBeDisabled();

    await page.getByTestId('budget-expense-filters-search').fill('Pontual 05');
    await expect(list.locator('tbody tr')).toHaveCount(1);
    await expect(list).toContainText('Pontual 05');

    await page.getByTestId('budget-expense-filters-reset').click();
    await expect(list.locator('tbody tr')).toHaveCount(20);

    await list.getByRole('button', { name: 'Descrição' }).click();
    await expect(list.locator('tbody tr').first()).toContainText('Pontual 01');
  });
});
