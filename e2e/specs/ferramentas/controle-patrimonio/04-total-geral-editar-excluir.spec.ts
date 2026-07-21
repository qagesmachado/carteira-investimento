import { expect, test } from '../../fixtures/test';

import {
  fillManualPatrimonyForm,
  gotoPatrimonyControlPage,
  openManualPatrimonyForm,
  saveManualPatrimonyForm
} from '../../helpers/patrimonyControlPage';
import {
  getPatrimonyControlSnapshot,
  seedPatrimonyControlFullMix
} from '../../helpers/seedPatrimonyControl';

/** @see ../../../casos-de-uso/ui/controle-patrimonio/04-total-geral-editar-excluir.md */
test.describe('UI-PAT-004', () => {
  test.describe.configure({ mode: 'serial' });

  let portfolioId: number;
  let cashItemId: number;

  test.beforeEach(async ({ request }) => {
    portfolioId = await seedPatrimonyControlFullMix(request);
    const snapshot = await getPatrimonyControlSnapshot(request, portfolioId);
    const cashItem = snapshot.manual_items.find(
      (item: { name: string }) => item.name === 'Cofre casa'
    );
    expect(cashItem).toBeTruthy();
    cashItemId = cashItem.id;
  });

  test('total geral reflete manuais; editar e excluir', async ({ page }) => {
    await gotoPatrimonyControlPage(page);
    await expect(page.getByTestId('summary-invested')).toHaveText('R$ 1.000,00');
    await expect(page.getByTestId('summary-emergency')).toHaveText('R$ 6.150,89');
    await expect(page.getByTestId('summary-total')).toHaveText('R$ 7.150,89');

    const decimalRow = page.locator('[data-testid^="manual-item-row-"]').filter({
      hasText: 'Caixinha Nubank'
    });
    await decimalRow.getByTestId(/^edit-item-/).click();
    await expect(page.getByTestId('manual-patrimony-amount')).toHaveValue('650,89');
    await page.getByRole('button', { name: 'Cancelar' }).click();

    const reserveRow = page.locator('[data-testid^="manual-item-row-"]').filter({
      hasText: 'Conta Nubank'
    });
    await reserveRow.getByTestId(/^edit-item-/).click();
    await fillManualPatrimonyForm(page, {
      name: 'Conta Nubank',
      amount: '4000',
      location: 'corretora'
    });
    await saveManualPatrimonyForm(page);
    await expect(page.getByTestId('summary-invested')).toHaveText('R$ 1.000,00');
    await expect(page.getByTestId('summary-emergency')).toHaveText('R$ 5.150,89');
    await expect(page.getByTestId('summary-total')).toHaveText('R$ 6.150,89');

    page.once('dialog', (dialog) => dialog.accept());
    const deleteReload = page.waitForResponse(
      (response) =>
        response.url().includes('/patrimony-control') &&
        response.request().method() === 'GET' &&
        response.ok(),
      { timeout: 15_000 }
    );
    await page.getByTestId(`delete-item-${cashItemId}`).click();
    await deleteReload;
    await expect(page.getByTestId('summary-emergency')).toHaveText('R$ 4.650,89');
    await expect(page.getByTestId('summary-total')).toHaveText('R$ 5.650,89');
  });
});
