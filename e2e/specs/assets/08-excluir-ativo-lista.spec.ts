/**
 * UI-AST-008 — Excluir ativo na listagem
 * @see ../../../casos-de-uso/ui/assets/08-excluir-ativo-lista.md
 */
import { expect, test } from '../fixtures/test';


import { registeredAssetsTable } from '../helpers/assetsPage';
import { TICKER_ITSA4 } from '../helpers/e2eFixtures';
import { clickDeleteOnRow } from '../helpers/listagem';
import { gotoAssetsPage, seedItsa4 } from '../helpers/seedAssets';

test.describe('UI-AST-008', () => {
  test.beforeEach(async ({ request }) => {
    await seedItsa4(request);
  });

  test('exclui ativo confirmando o diálogo', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.accept());

    await gotoAssetsPage(page);
    await clickDeleteOnRow(page, TICKER_ITSA4);

    await expect(
      registeredAssetsTable(page).locator('tbody tr').filter({ hasText: TICKER_ITSA4 })
    ).toHaveCount(0);
  });
});
