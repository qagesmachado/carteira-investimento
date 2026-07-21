import { expect, test } from '../fixtures/test';

import { gotoFinanceiroOrcamento } from '../helpers/financeiroPage';
import {
  createBudgetExpenseViaApi,
  createBudgetTagViaApi,
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/15-transacoes-filtro-paginacao.md */
test.describe('UI-FIN-015', () => {
  test('filtra e pagina transações recentes', async ({ page, request }) => {
    const profile = await seedBudgetProfile(request);
    const yearMonth = currentBudgetYearMonth();
    const snapshot = await getMonthSnapshotViaApi(request, profile.id, yearMonth);
    const category = snapshot.categories[0];
    const tag = await createBudgetTagViaApi(request, profile.id, 'Mercado', '#22c55e');

    for (let i = 1; i <= 22; i += 1) {
      await createBudgetExpenseViaApi(request, profile.id, yearMonth, {
        description: `Despesa ${String(i).padStart(2, '0')}`,
        amount_brl: 10 + i,
        category_id: category.category_id,
        event_date: `${yearMonth}-${String((i % 28) + 1).padStart(2, '0')}`
      });
    }
    await createBudgetExpenseViaApi(request, profile.id, yearMonth, {
      description: 'Compra especial mercado',
      amount_brl: 999,
      category_id: category.category_id,
      tag_id: tag.id,
      event_date: `${yearMonth}-15`
    });

    await gotoFinanceiroOrcamento(page, yearMonth);

    await expect(page.getByTestId('budget-transactions-count')).toHaveText('23 transações');

    const list = page.getByTestId('budget-transactions-list');
    const pager = page.getByRole('navigation', { name: 'Paginação de transações', exact: true });
    await expect(list.locator('tr')).toHaveCount(20);
    await expect(pager).toContainText('de 23');

    await pager.getByRole('button', { name: 'Próxima' }).click();
    await expect(list.locator('tr')).toHaveCount(3);
    await expect(pager.getByRole('button', { name: 'Próxima' })).toBeDisabled();

    await page.getByTestId('budget-transactions-search').fill('especial');
    await expect(list.locator('tr')).toHaveCount(1);
    await expect(list).toContainText('Compra especial mercado');
    await expect(page.getByTestId('budget-transactions-count')).toHaveText('1 transação');

    await page.getByTestId('budget-transactions-reset').click();
    await expect(page.getByTestId('budget-transactions-count')).toHaveText('23 transações');
    await expect(list.locator('tr')).toHaveCount(20);

    await page.getByRole('button', { name: 'Data', exact: true }).click();
    await expect(list.locator('tr').first()).toContainText('Despesa 01');
  });
});
