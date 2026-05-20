/**
 * UI-AST-016 — Cancelar exclusão na listagem
 * @see ../../../casos-de-uso/ui/assets/16-excluir-cancelar.md
 */
import { expect, test } from '@playwright/test';

import { registeredAssetsTable } from '../helpers/assetsPage';
import { TICKER_FLRY3 } from '../helpers/e2eFixtures';
import { clickDeleteOnRow } from '../helpers/listagem';
import { gotoAssetsPage, seedFlry3 } from '../helpers/seedAssets';

test.describe('UI-AST-016', () => {
  test.beforeEach(async ({ request }) => {
    await seedFlry3(request);
  });

  test('mantém ativo ao cancelar o diálogo de exclusão', async ({ page }) => {
    page.once('dialog', (dialog) => dialog.dismiss());

    await gotoAssetsPage(page);
    await clickDeleteOnRow(page, TICKER_FLRY3);

    await expect(
      registeredAssetsTable(page).locator('tbody tr').filter({ hasText: TICKER_FLRY3 })
    ).toHaveCount(1);
  });
});
