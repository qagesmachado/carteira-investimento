import { expect, test } from '../fixtures/test';

import {
  createCustomBudgetMeta,
  gotoFinanceiroMetas,
  saveBudgetTargets
} from '../helpers/financeiroPage';
import {
  currentBudgetYearMonth,
  getMonthTargetsViaApi,
  seedBudgetProfile,
  updateBudgetIncomesViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/03-metas-personalizadas-crud.md */
test.describe('UI-FIN-003', () => {
  let profileId = 0;
  const yearMonth = currentBudgetYearMonth();

  test.beforeEach(async ({ request }) => {
    const profile = await seedBudgetProfile(request);
    profileId = profile.id;
    await updateBudgetIncomesViaApi(request, profileId, yearMonth, [
      { label: 'Salário', amount_brl: 10_000 }
    ]);
  });

  test('cria meta personalizada e persiste no conjunto do mês', async ({ page, request }) => {
    await gotoFinanceiroMetas(page);

    await createCustomBudgetMeta(page, 'Viagens');
    await expect(page.getByText('Viagens').first()).toBeVisible();

    await saveBudgetTargets(page);

    const saved = await getMonthTargetsViaApi(request, profileId, yearMonth);
    const names = saved.categories.map((category: { category_name: string }) => category.category_name);
    expect(names).toContain('Viagens');
    expect(saved.categories.length).toBe(7);
  });
});
