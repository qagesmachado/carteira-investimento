import { expect, test } from '../fixtures/test';

import {
  fillBrDecimalTestInput,
  gotoFinanceiroMetas,
  saveBudgetTargets
} from '../helpers/financeiroPage';
import {
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile,
  updateBudgetIncomesViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/03-metas-valor-reais.md */
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

  test('modo R$ recalcula percentuais ao salvar', async ({ page, request }) => {
    const snapshot = await getMonthSnapshotViaApi(request, profileId, yearMonth);
    const [first, second, ...rest] = snapshot.categories;

    await gotoFinanceiroMetas(page);
    await page.getByTestId('budget-target-mode-amount').click();

    await fillBrDecimalTestInput(page, `budget-target-amount-${first.category_id}`, '5000');
    await fillBrDecimalTestInput(page, `budget-target-amount-${second.category_id}`, '5000');
    for (const category of rest) {
      await fillBrDecimalTestInput(page, `budget-target-amount-${category.category_id}`, '0');
    }

    await saveBudgetTargets(page);

    const saved = await getMonthSnapshotViaApi(request, profileId, yearMonth);
    expect(saved.categories[0].percent).toBe(50);
    expect(saved.categories[1].percent).toBe(50);
  });
});
