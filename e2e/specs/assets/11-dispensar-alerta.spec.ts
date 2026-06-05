/**
 * UI-AST-011 — Dispensar alerta na página
 * @see ../../../casos-de-uso/ui/assets/11-dispensar-alerta.md
 */
import { test } from '../fixtures/test';


import { getWorkerApiBaseUrl } from '../helpers/workerContext';
import { fillAndSaveManualFixedIncome, startManualFixedIncome } from '../helpers/manualAssetForm';
import { dismissAlert } from '../helpers/lookupFlows';
import { clearAllTestAssets, gotoAssetsPage } from '../helpers/seedAssets';

test.describe('UI-AST-011', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
  });

  test('fecha alerta de sucesso após salvar', async ({ page }) => {
    await gotoAssetsPage(page);
    await startManualFixedIncome(page);
    await fillAndSaveManualFixedIncome(page);
    await dismissAlert(page);
  });
});
