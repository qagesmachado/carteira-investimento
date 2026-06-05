import { expect, test } from '../fixtures/test';


import {
  clickAnalyzePortfolioImport,
  clickConfirmPortfolioImport,
  gotoDadosPage,
  uploadPortfolioImportFile
} from '../helpers/dataPage';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import { setConflictResolution } from '../helpers/portfoliosPage';
import { seedPortfoliosForImportConflict } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-019 — Importar com conflito (usar arquivo) via /dados
 * @see ../../../casos-de-uso/ui/portfolios/19-importar-conflito-usar-arquivo.md
 */
test.describe('UI-PRT-019', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosForImportConflict(request);
  });

  test('resolve conflito de ativo escolhendo usar arquivo', async ({ page }) => {
    await gotoDadosPage(page);
    await uploadPortfolioImportFile(page, 'specs/fixtures/e2e-import-conflict.carteira.json');
    await clickAnalyzePortfolioImport(page);
    await setConflictResolution(page, TICKER_BBSE3, 'name', 'use_file');
    await clickConfirmPortfolioImport(page);
    await expect(page.getByText(/Importação concluída/i)).toBeVisible();
    await expect(page.getByLabel('Selecionar carteira')).toContainText('E2E Import Conflito');
  });
});
