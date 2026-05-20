/**
 * UI-AST-007 — Editar ativo na listagem
 * @see ../../../casos-de-uso/ui/assets/07-editar-ativo-lista.md
 */
import { expect, test } from '@playwright/test';

import { registeredAssetsTable, reviewForm } from '../helpers/assetsPage';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import { clickEditOnRow } from '../helpers/listagem';
import { gotoAssetsPage, seedBbse3 } from '../helpers/seedAssets';

test.describe('UI-AST-007', () => {
  test.beforeEach(async ({ request }) => {
    await seedBbse3(request);
  });

  test('edita ativo cadastrado pela listagem', async ({ page }) => {
    await gotoAssetsPage(page);
    await clickEditOnRow(page, TICKER_BBSE3);

    const form = reviewForm(page);
    await form.getByLabel(/Observações/).fill('Nota E2E atualizada');

    const updateResponse = page.waitForResponse(
      (response) =>
        response.request().method() === 'PATCH' &&
        response.url().includes('/assets/') &&
        response.ok()
    );
    await form.getByRole('button', { name: 'Atualizar ativo' }).click();
    await updateResponse;

    await expect(registeredAssetsTable(page).locator('tbody tr').filter({ hasText: TICKER_BBSE3 })).toHaveCount(1);
  });
});
