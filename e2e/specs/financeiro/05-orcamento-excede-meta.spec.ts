import { expect, test } from '../fixtures/test';

import { gotoFinanceiroOrcamento } from '../helpers/financeiroPage';
import {
  createBudgetExpenseViaApi,
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile,
  updateBudgetTargetsViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/05-orcamento-excede-meta.md */
test.describe('UI-FIN-005', () => {
  test('meta excedida mostra badge Excedido', async ({ page, request }) => {
    const profile = await seedBudgetProfile(request);
    const yearMonth = currentBudgetYearMonth();
    const snapshot = await getMonthSnapshotViaApi(request, profile.id, yearMonth);
    const category = snapshot.categories[0];
    await updateBudgetTargetsViaApi(
      request,
      profile.id,
      yearMonth,
      1000,
      snapshot.categories.map((item: { category_id: number; percent: number }) => ({
        category_id: item.category_id,
        percent: item.percent
      }))
    );
    await createBudgetExpenseViaApi(request, profile.id, yearMonth, {
      description: 'Conta alta',
      amount_brl: 500,
      category_id: category.category_id
    });

    await gotoFinanceiroOrcamento(page, yearMonth);
    await expect(page.getByTestId(`budget-category-card-${category.category_id}`)).toContainText(
      'Excedido'
    );
  });
});
