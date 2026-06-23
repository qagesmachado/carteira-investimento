import { expect, test } from '../../fixtures/test';

import {
  fillManualPatrimonyForm,
  gotoPatrimonyControlPage,
  openManualPatrimonyForm,
  saveManualPatrimonyForm
} from '../../helpers/patrimonyControlPage';
import { seedPatrimonyControlWithStock } from '../../helpers/seedPatrimonyControl';

/** @see ../../../casos-de-uso/ui/ferramentas/controle-patrimonio/03-adicionar-dinheiro-especie.md */
test.describe('UI-PAT-003', () => {
  test.beforeEach(async ({ request }) => {
    await seedPatrimonyControlWithStock(request);
  });

  test('adiciona dinheiro em espécie na reserva de emergência', async ({ page }) => {
    await gotoPatrimonyControlPage(page);
    await openManualPatrimonyForm(page);
    await fillManualPatrimonyForm(page, {
      name: 'Cofre casa',
      amount: '500',
      location: 'dinheiro_especie'
    });
    await saveManualPatrimonyForm(page);

    await expect(page.getByTestId('patrimony-emergency-section')).toContainText('Cofre casa');
    await expect(page.getByTestId('patrimony-emergency-section')).toContainText(
      'Dinheiro em espécie'
    );
    await expect(page.getByTestId('summary-emergency')).toHaveText('R$ 500,00');
  });
});
