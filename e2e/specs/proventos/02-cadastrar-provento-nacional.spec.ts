import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  expectPaymentRow,
  fillProventoForm,
  gotoProventosPage,
  pickAssetInProventoForm,
  submitProventoForm
} from '../helpers/proventosPage';
import { seedProventosWithBbse3 } from '../helpers/seedProventos';

/**
 * UI-PRV-002 — Cadastrar provento nacional
 * @see ../../../casos-de-uso/ui/proventos/02-cadastrar-provento-nacional.md
 */
test.describe('UI-PRV-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosWithBbse3(request);
  });

  test('cadastra dividendo em ativo BRL', async ({ page }) => {
    await gotoProventosPage(page);

    await pickAssetInProventoForm(page, TICKER_BBSE3);
    await fillProventoForm(page, {
      type: 'Dividendo',
      dateBr: '15/05/2024',
      amount: '120,50'
    });
    await submitProventoForm(page);

    await expect(page.getByRole('alert').filter({ hasText: 'Provento cadastrado.' })).toBeVisible();
    await expectPaymentRow(page, TICKER_BBSE3, { typeLabel: 'Dividendo' });
  });
});
