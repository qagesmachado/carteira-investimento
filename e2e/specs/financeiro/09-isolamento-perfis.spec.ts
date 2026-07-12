import { expect, test } from '../fixtures/test';

import { gotoFinanceiroOrcamento } from '../helpers/financeiroPage';
import {
  createBudgetExpenseViaApi,
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetTwoProfiles,
  setActiveBudgetProfileViaApi
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/09-isolamento-perfis.md */
test.describe('UI-FIN-009', () => {
  test('perfil B não vê despesa do perfil A', async ({ page, request }) => {
    const { profileA, profileB } = await seedBudgetTwoProfiles(request);
    const yearMonth = currentBudgetYearMonth();
    const snapshotA = await getMonthSnapshotViaApi(request, profileA.id, yearMonth);
    await createBudgetExpenseViaApi(request, profileA.id, yearMonth, {
      description: 'Segredo A',
      amount_brl: 999,
      category_id: snapshotA.categories[0].category_id
    });

    await setActiveBudgetProfileViaApi(request, profileB.id);
    await gotoFinanceiroOrcamento(page, yearMonth);
    await expect(page.getByText('Segredo A')).toHaveCount(0);
  });
});
