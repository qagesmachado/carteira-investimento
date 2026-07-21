import { expect, test } from '../fixtures/test';

import {
  gotoFinanceiroMetas,
  saveBudgetTargets
} from '../helpers/financeiroPage';
import { currentBudgetYearMonth, seedBudgetProfile, updateBudgetIncomesViaApi } from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/02-metas-percentual.md */
test.describe('UI-FIN-002', () => {
  let profileId = 0;
  const yearMonth = currentBudgetYearMonth();

  test.beforeEach(async ({ request }) => {
    const profile = await seedBudgetProfile(request);
    profileId = profile.id;
    await updateBudgetIncomesViaApi(request, profileId, yearMonth, [
      { label: 'Salário', amount_brl: 10_000 }
    ]);
  });

  test('salva metas em % e exibe previsto em R$', async ({ page }) => {
    await gotoFinanceiroMetas(page);
    await expect(page.getByTestId('budget-planned-income')).toHaveText('R$ 10.000,00');
    await saveBudgetTargets(page);
    await expect(page.getByTestId('budget-allocated-percent')).toContainText('100%');
    await expect(page.getByTestId('budget-allocated-remaining')).toHaveCount(0);
    await expect(page.getByText('R$ 2.100,00').first()).toBeVisible();
  });
});
