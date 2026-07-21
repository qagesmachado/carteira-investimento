import { expect, test } from '../fixtures/test';

import {
  gotoFinanceiroMetas,
  gotoNextBudgetMonth,
  removeBudgetMetaFromMonth,
  saveBudgetTargets,
  setBudgetTargetPercent
} from '../helpers/financeiroPage';
import {
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  getMonthTargetsViaApi,
  seedBudgetProfile,
  shiftBudgetYearMonth,
  updateBudgetIncomesViaApi,
  updateBudgetTargetsViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/18-metas-heranca-mes.md */
test.describe('UI-FIN-018', () => {
  let profileId = 0;
  let firstId = 0;
  let secondId = 0;
  const yearMonth = currentBudgetYearMonth();
  const nextMonth = shiftBudgetYearMonth(yearMonth, 1);

  test.beforeEach(async ({ request }) => {
    const profile = await seedBudgetProfile(request);
    profileId = profile.id;
    await updateBudgetIncomesViaApi(request, profileId, yearMonth, [
      { label: 'Salário', amount_brl: 10_000 }
    ]);
    const snapshot = await getMonthSnapshotViaApi(request, profileId, yearMonth);
    firstId = snapshot.categories[0].category_id;
    secondId = snapshot.categories[1].category_id;
    await updateBudgetTargetsViaApi(request, profileId, yearMonth, 10_000, [
      { category_id: firstId, percent: 60 },
      { category_id: secondId, percent: 40 }
    ]);
  });

  test('mês seguinte herda o conjunto e editá-lo não afeta o anterior', async ({ page, request }) => {
    await gotoFinanceiroMetas(page);
    await expect(page.getByTestId(`budget-target-card-${firstId}`)).toBeVisible();
    await expect(page.getByTestId(`budget-target-card-${secondId}`)).toBeVisible();
    await expect(page.getByTestId('budget-targets-inherited-badge')).toHaveCount(0);

    await gotoNextBudgetMonth(page);
    await expect(page.getByTestId('budget-targets-inherited-badge')).toBeVisible();
    await expect(page.getByTestId(`budget-target-card-${firstId}`)).toBeVisible();
    await expect(page.getByTestId(`budget-target-card-${secondId}`)).toBeVisible();

    // Remove a segunda meta só deste mês (sem redistribuir) e evidencia o que falta.
    await removeBudgetMetaFromMonth(page, secondId, { applyToFollowingMonths: false });
    await expect(page.getByTestId(`budget-target-card-${secondId}`)).toHaveCount(0);
    await expect(page.getByTestId('budget-allocated-remaining')).toContainText('Faltam 40%');

    await setBudgetTargetPercent(page, firstId, 100);
    await saveBudgetTargets(page, { applyToFollowingMonths: false });

    const nextSaved = await getMonthTargetsViaApi(request, profileId, nextMonth);
    expect(nextSaved.categories.length).toBe(1);
    expect(nextSaved.categories[0].category_id).toBe(firstId);
    expect(nextSaved.categories[0].percent).toBe(100);

    // O mês original permanece intacto.
    const original = await getMonthTargetsViaApi(request, profileId, yearMonth);
    const byId = Object.fromEntries(
      original.categories.map((c: { category_id: number; percent: number }) => [c.category_id, c.percent])
    );
    expect(original.categories.length).toBe(2);
    expect(byId[firstId]).toBe(60);
    expect(byId[secondId]).toBe(40);
  });
});
