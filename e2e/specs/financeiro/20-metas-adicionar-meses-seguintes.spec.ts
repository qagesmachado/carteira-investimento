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
  shiftBudgetYearMonth,
  updateBudgetIncomesViaApi,
  updateBudgetTargetsViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/20-metas-adicionar-meses-seguintes.md */
test.describe('UI-FIN-020', () => {
  let profileId = 0;
  let firstId = 0;
  let secondId = 0;
  const yearMonth = currentBudgetYearMonth();
  const prevMonth = shiftBudgetYearMonth(yearMonth, -1);
  const nextMonth = shiftBudgetYearMonth(yearMonth, 1);

  test.beforeEach(async ({ request }) => {
    const profile = await seedBudgetProfile(request);
    profileId = profile.id;
    await updateBudgetIncomesViaApi(request, profileId, yearMonth, [
      { label: 'Salário', amount_brl: 10_000 }
    ]);
    const snapshot = await getMonthTargetsViaApi(request, profileId, yearMonth);
    firstId = snapshot.categories[0].category_id;
    secondId = snapshot.categories[1].category_id;
    const base = [
      { category_id: firstId, percent: 60 },
      { category_id: secondId, percent: 40 }
    ];
    await updateBudgetTargetsViaApi(request, profileId, prevMonth, 10_000, base);
    await updateBudgetTargetsViaApi(request, profileId, yearMonth, 10_000, base);
    await updateBudgetTargetsViaApi(request, profileId, nextMonth, 10_000, base);
  });

  test('modal aplica meta aos meses seguintes e não altera o anterior', async ({ page, request }) => {
    await gotoFinanceiroMetas(page);

    await page.getByTestId('budget-add-meta-btn').click();
    await expect(page.getByTestId('budget-add-meta-modal')).toBeVisible();
    await expect(page.getByTestId('budget-add-meta-following-months')).toBeChecked();
    await page.getByTestId('budget-add-meta-cancel').click();

    await createCustomBudgetMeta(page, 'Propagada', { applyToFollowingMonths: true });
    await expect(page.getByText('Propagada').first()).toBeVisible();
    await saveBudgetTargets(page);

    const current = await getMonthTargetsViaApi(request, profileId, yearMonth);
    const next = await getMonthTargetsViaApi(request, profileId, nextMonth);
    const prev = await getMonthTargetsViaApi(request, profileId, prevMonth);

    const currentNames = current.categories.map(
      (c: { category_name: string }) => c.category_name
    );
    const nextByName = Object.fromEntries(
      next.categories.map((c: { category_name: string; percent: number }) => [
        c.category_name,
        c.percent
      ])
    );
    const prevNames = prev.categories.map((c: { category_name: string }) => c.category_name);

    expect(currentNames).toContain('Propagada');
    expect(nextByName.Propagada).toBe(0);
    expect(prevNames).not.toContain('Propagada');
  });
});
