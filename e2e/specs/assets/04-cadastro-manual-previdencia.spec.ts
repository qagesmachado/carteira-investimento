/**
 * UI-AST-004 — Cadastro manual de previdência
 * @see ../../../casos-de-uso/ui/assets/04-cadastro-manual-previdencia.md
 */
import { expect, test } from '../fixtures/test';


import { getWorkerApiBaseUrl } from '../helpers/workerContext';
import { registeredAssetsTable } from '../helpers/assetsPage';
import { E2E_PENSION_IDENTIFIER, E2E_PENSION_NAME } from '../helpers/e2eFixtures';
import { fillAndSaveManualPension, startManualPension } from '../helpers/manualAssetForm';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-004', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
  });

  test('cadastra previdência manual e persiste', async ({ page }) => {
    await gotoAssetsPage(page);
    await startManualPension(page);
    await fillAndSaveManualPension(page);

    const table = registeredAssetsTable(page);
    const row = table.locator('tbody tr').filter({ hasText: E2E_PENSION_IDENTIFIER });
    await expect(row).toContainText(E2E_PENSION_NAME);
    await expect(row).toContainText('Previdência');

    await page.reload();
    await expect(row).toHaveCount(1);
  });
});
