import { expect, test } from '../fixtures/test';

import { gotoFinanceiroOrcamento } from '../helpers/financeiroPage';
import {
  createBudgetExpenseViaApi,
  createBudgetTagViaApi,
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/06-orcamento-drilldown-tag.md */
test.describe('UI-FIN-006', () => {
  test('drill-down lista despesa com tag', async ({ page, request }) => {
    const profile = await seedBudgetProfile(request);
    const yearMonth = currentBudgetYearMonth();
    const snapshot = await getMonthSnapshotViaApi(request, profile.id, yearMonth);
    const category = snapshot.categories[0];
    const tag = await createBudgetTagViaApi(request, profile.id, 'Mercado', '#22c55e');
    await createBudgetExpenseViaApi(request, profile.id, yearMonth, {
      description: 'Compras',
      amount_brl: 120,
      category_id: category.category_id,
      tag_id: tag.id
    });

    await gotoFinanceiroOrcamento(page, yearMonth);
    const card = page.getByTestId(`budget-category-card-${category.category_id}`);
    await expect(card.getByTestId('budget-category-item-count')).toHaveText('1 item');
    await card.getByRole('button', { name: 'Ver itens' }).click();
    await expect(card.getByText('Compras')).toBeVisible();
    await expect(card.getByText('Mercado')).toBeVisible();
  });
});
