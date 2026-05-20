/**
 * UI-AST-013 — Validação de campos obrigatórios na RF manual
 * @see ../../../casos-de-uso/ui/assets/13-rf-validacao-campos-obrigatorios.md
 */
import { expect, test } from '@playwright/test';

import { API_BASE_URL } from '../helpers/apiResponses';
import { registeredAssetsTable, reviewForm } from '../helpers/assetsPage';
import { submitManualFixedIncomeEmpty } from '../helpers/manualAssetForm';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-013', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllTestAssets(request, API_BASE_URL);
  });

  test('não salva RF com campos obrigatórios vazios', async ({ page }) => {
    await gotoAssetsPage(page);
    await submitManualFixedIncomeEmpty(page);

    await expect(registeredAssetsTable(page).locator('tbody tr')).toHaveCount(0);
    await expect(reviewForm(page)).toBeVisible();
  });
});
