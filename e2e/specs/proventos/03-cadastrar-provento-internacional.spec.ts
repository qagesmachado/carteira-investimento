import { expect, test } from '../fixtures/test';


import { TICKER_VOO } from '../helpers/e2eFixtures';
import {
  expectPaymentRow,
  fillProventoForm,
  goToProventosListTab,
  gotoProventosPage,
  paymentsListSection,
  pickAssetInProventoForm,
  submitProventoForm
} from '../helpers/proventosPage';
import { seedProventosWithBbse3AndVoo } from '../helpers/seedProventos';

/**
 * UI-PRV-003 — Cadastrar provento internacional
 * @see ../../../casos-de-uso/ui/proventos/03-cadastrar-provento-internacional.md
 */
test.describe('UI-PRV-003', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosWithBbse3AndVoo(request);
  });

  test('cadastra dividendo em ativo USD', async ({ page }) => {
    await gotoProventosPage(page);

    await pickAssetInProventoForm(page, TICKER_VOO);
    await fillProventoForm(page, {
      type: 'Dividendo',
      dateBr: '01/06/2024',
      amount: '15,75'
    });
    await submitProventoForm(page);

    await goToProventosListTab(page);
    await expectPaymentRow(page, TICKER_VOO, { typeLabel: 'Dividendo' });
    await expect(paymentsListSection(page).locator('tr').filter({ hasText: TICKER_VOO })).toContainText('USD');
  });
});
