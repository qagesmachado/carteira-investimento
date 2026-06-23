import { expect, test } from '../../fixtures/test';

import {
  fillManualPatrimonyForm,
  gotoPatrimonyControlPage,
  openManualPatrimonyForm,
  saveManualPatrimonyForm
} from '../../helpers/patrimonyControlPage';
import { seedPatrimonyControlWithStock } from '../../helpers/seedPatrimonyControl';

/** @see ../../../casos-de-uso/ui/ferramentas/controle-patrimonio/02-adicionar-reserva-emergencia.md */
test.describe('UI-PAT-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedPatrimonyControlWithStock(request);
  });

  test('adiciona reserva de emergência com onde está', async ({ page }) => {
    await gotoPatrimonyControlPage(page);
    await openManualPatrimonyForm(page);
    await fillManualPatrimonyForm(page, {
      name: 'Conta Nubank',
      amount: '5000',
      location: 'banco'
    });
    await saveManualPatrimonyForm(page);

    await expect(page.getByTestId('patrimony-emergency-section')).toContainText('Conta Nubank');
    await expect(page.getByTestId('patrimony-emergency-section')).toContainText('Banco');
    await expect(page.getByTestId('summary-emergency')).toHaveText('R$ 5.000,00');
  });
});
