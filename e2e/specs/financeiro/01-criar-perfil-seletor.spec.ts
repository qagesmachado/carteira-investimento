import { expect, test } from '../fixtures/test';

import {
  createBudgetProfileFromUi,
  gotoFinanceiroPainel,
  selectBudgetProfile
} from '../helpers/financeiroPage';
import { clearAllBudgetProfiles, seedBudgetTwoProfiles } from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/01-criar-perfil-seletor.md */
test.describe('UI-FIN-001', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllBudgetProfiles(request);
  });

  test('cria perfil e reflete no seletor', async ({ page }) => {
    await createBudgetProfileFromUi(page, 'Casa E2E');
    await gotoFinanceiroPainel(page);
    await expect(page.getByTestId('budget-profile-select')).toContainText('Casa E2E');
  });

  test('troca perfil ativo no seletor', async ({ page, request }) => {
    const { profileA, profileB } = await seedBudgetTwoProfiles(request);
    await gotoFinanceiroPainel(page);
    await selectBudgetProfile(page, profileB.name);
    await expect(page.getByTestId('budget-profile-select')).toHaveValue(String(profileB.id));
    await selectBudgetProfile(page, profileA.name);
    await expect(page.getByTestId('budget-profile-select')).toHaveValue(String(profileA.id));
  });
});
