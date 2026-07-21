import { expect, test } from '../../fixtures/test';

import {
  fillManualPatrimonyForm,
  gotoPatrimonyControlPage,
  openManualPatrimonyForm,
  saveManualPatrimonyForm
} from '../../helpers/patrimonyControlPage';
import { seedPatrimonyControlWithStock } from '../../helpers/seedPatrimonyControl';

/** @see ../../../casos-de-uso/ui/controle-patrimonio/01-carregamento-investido-automatico.md */
test.describe('UI-PAT-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedPatrimonyControlWithStock(request);
  });

  test('exibe patrimônio investido automático', async ({ page }) => {
    await gotoPatrimonyControlPage(page);
    await expect(page.getByTestId('summary-invested')).toHaveText('R$ 1.000,00');
    await expect(page.getByTestId('summary-total')).toHaveText('R$ 1.000,00');
    await expect(page.getByTestId('invested-value')).toHaveText('R$ 1.000,00');
  });
});
