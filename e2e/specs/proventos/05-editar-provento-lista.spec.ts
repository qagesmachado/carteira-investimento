import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  clickEditOnRow,
  editProventoModal,
  expectPaymentRow,
  fillEditProventoModal,
  gotoProventosListPage,
  paymentsTable,
  saveEditProventoModal
} from '../helpers/proventosPage';
import { seedProventosWithOnePayment } from '../helpers/seedProventos';

/**
 * UI-PRV-005 — Editar provento na lista
 * @see ../../../casos-de-uso/ui/proventos/05-editar-provento-lista.md
 */
test.describe('UI-PRV-005', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosWithOnePayment(request, {
      amount: 150.75,
      payment_date: '2024-06-15'
    });
  });

  test('altera valor e data do lançamento', async ({ page }) => {
    await gotoProventosListPage(page);

    await clickEditOnRow(page, TICKER_BBSE3);
    await expect(editProventoModal(page)).toBeVisible();

    await fillEditProventoModal(page, {
      dateBr: '20/07/2024',
      amount: '200,00'
    });
    await saveEditProventoModal(page);

    await expect(page.getByRole('alert').filter({ hasText: 'Provento atualizado.' })).toBeVisible();
    await expectPaymentRow(page, TICKER_BBSE3, { amountPattern: /200/ });
    await expect(paymentsTable(page).locator('tr').filter({ hasText: TICKER_BBSE3 })).toContainText('20/07/2024');
  });
});
