import { expect, test } from '../fixtures/test';

import {
  gotoFinanceiroMetas,
  removeBudgetMetaFromMonth,
  saveBudgetTargets,
  setBudgetTargetPercent
} from '../helpers/financeiroPage';
import {
  currentBudgetYearMonth,
  getMonthTargetsViaApi,
  seedBudgetProfile,
  shiftBudgetYearMonth,
  updateBudgetIncomesViaApi,
  updateBudgetTargetsViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/21-metas-escopo-salvar-remover.md */
test.describe('UI-FIN-021', () => {
  let profileId = 0;
  let firstId = 0;
  let secondId = 0;
  let thirdId = 0;
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
    thirdId = snapshot.categories[2].category_id;
    const base = [
      { category_id: firstId, percent: 50 },
      { category_id: secondId, percent: 30 },
      { category_id: thirdId, percent: 20 }
    ];
    await updateBudgetTargetsViaApi(request, profileId, prevMonth, 10_000, base);
    await updateBudgetTargetsViaApi(request, profileId, yearMonth, 10_000, base);
    await updateBudgetTargetsViaApi(request, profileId, nextMonth, 10_000, base);
  });

  test('salvar com escopo aplica % aos meses seguintes e remover também', async ({
    page,
    request
  }) => {
    await gotoFinanceiroMetas(page);

    await setBudgetTargetPercent(page, firstId, 70);
    await setBudgetTargetPercent(page, secondId, 20);
    await setBudgetTargetPercent(page, thirdId, 10);

    await page.getByTestId('budget-save-targets-btn').click();
    await expect(page.getByTestId('budget-save-targets-modal')).toBeVisible();
    await expect(page.getByTestId('budget-save-targets-following-months')).toBeChecked();
    await page.getByTestId('budget-save-targets-confirm').click();

    const nextAfterSave = await getMonthTargetsViaApi(request, profileId, nextMonth);
    const nextById = Object.fromEntries(
      nextAfterSave.categories.map((c: { category_id: number; percent: number }) => [
        c.category_id,
        c.percent
      ])
    );
    expect(nextById[firstId]).toBe(70);
    expect(nextById[secondId]).toBe(20);
    expect(nextById[thirdId]).toBe(10);

    const prevAfterSave = await getMonthTargetsViaApi(request, profileId, prevMonth);
    expect(prevAfterSave.categories).toHaveLength(3);

    await removeBudgetMetaFromMonth(page, thirdId, { applyToFollowingMonths: true });
    await expect(page.getByTestId('budget-allocated-remaining')).toContainText('Faltam 10%');
    await setBudgetTargetPercent(page, firstId, 80);
    await saveBudgetTargets(page, { applyToFollowingMonths: false });

    const current = await getMonthTargetsViaApi(request, profileId, yearMonth);
    const next = await getMonthTargetsViaApi(request, profileId, nextMonth);
    const prev = await getMonthTargetsViaApi(request, profileId, prevMonth);
    expect(current.categories.map((c: { category_id: number }) => c.category_id)).not.toContain(
      thirdId
    );
    expect(next.categories.map((c: { category_id: number }) => c.category_id)).not.toContain(thirdId);
    expect(prev.categories.map((c: { category_id: number }) => c.category_id)).toContain(thirdId);
  });
});
