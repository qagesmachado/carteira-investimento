import { expect, test } from '@playwright/test';

import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  clickAnalyzeImport,
  clickConfirmImport,
  gotoPortfoliosPage,
  setConflictResolution,
  uploadImportFile
} from '../helpers/portfoliosPage';
import { seedPortfoliosForImportConflict } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-019 — Importar com conflito (usar arquivo)
 * @see ../../../casos-de-uso/ui/portfolios/19-importar-conflito-usar-arquivo.md
 */
test.describe('UI-PRT-019', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosForImportConflict(request);
  });

  test('resolve conflito de ativo escolhendo usar arquivo', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await uploadImportFile(page, 'specs/fixtures/e2e-import-conflict.carteira.json');
    await clickAnalyzeImport(page);
    await setConflictResolution(page, TICKER_BBSE3, 'name', 'use_file');
    await clickConfirmImport(page);
    await expect(page.getByRole('alert').filter({ hasText: /Importação concluída/i })).toBeVisible();
    await expect(page.getByRole('button', { name: 'E2E Import Conflito' })).toBeVisible();
  });
});
