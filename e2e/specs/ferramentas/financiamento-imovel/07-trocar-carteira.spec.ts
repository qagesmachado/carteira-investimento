import { expect, test } from '../../fixtures/test';

import {
  gotoFinanciamentoImovelPage,
  selectProfileByName
} from '../../helpers/financiamentoImovelPage';
import { seedPropertyFinancingTwoProfiles } from '../../helpers/seedPropertyFinancing';

/** @see ../../../../casos-de-uso/ui/ferramentas/financiamento-imovel/07-trocar-carteira.md UI-FERR-007 */
test.describe('UI-FERR-007', () => {
  test.beforeEach(async ({ request }) => {
    await seedPropertyFinancingTwoProfiles(request);
  });

  test('trocar perfil orçamentário exibe financiamentos distintos', async ({ page }) => {
    await gotoFinanciamentoImovelPage(page);
    await expect(page.getByRole('button', { name: /Apto Seed/ })).toBeVisible();

    await selectProfileByName(page, 'Perfil Fin B');
    await expect(page.getByText(/Nenhum financiamento cadastrado/)).toBeVisible();

    await selectProfileByName(page, 'Perfil Fin A');
    await expect(page.getByTestId('financing-summary')).toContainText('Apto Seed');
  });
});
