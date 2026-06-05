/**
 * UI-AST-003 — Cadastro manual de renda fixa
 * @see ../../../casos-de-uso/ui/assets/03-cadastro-manual-renda-fixa.md
 */
import { expect, test } from '../fixtures/test';


import { getWorkerApiBaseUrl } from '../helpers/workerContext';
import { registeredAssetsTable } from '../helpers/assetsPage';
import { E2E_CDB_NAME } from '../helpers/e2eFixtures';
import {
  fillAndSaveManualFixedIncome,
  startManualFixedIncome
} from '../helpers/manualAssetForm';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-003', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
  });

  test('cadastra renda fixa manual e persiste', async ({ page }) => {
    await gotoAssetsPage(page);
    await startManualFixedIncome(page);
    await fillAndSaveManualFixedIncome(page);

    const table = registeredAssetsTable(page);
    await expect(table.locator('tbody tr')).toContainText('Renda fixa');
    await expect(table.locator('tbody tr')).toContainText(E2E_CDB_NAME);

    await page.reload();
    await expect(table.locator('tbody tr')).toContainText(E2E_CDB_NAME);
  });
});
