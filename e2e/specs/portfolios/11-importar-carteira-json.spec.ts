import { expect, test } from '@playwright/test';

import { E2E_PORTFOLIO_IMPORT } from '../helpers/e2eFixtures';
import {
  clickAnalyzePortfolioImport,
  clickConfirmPortfolioImport,
  gotoDadosPage,
  uploadPortfolioImportFile
} from '../helpers/dataPage';
import { seedPortfoliosForImport } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-011 — Importar carteira JSON (legado → /dados)
 * @see ../../../casos-de-uso/ui/portfolios/11-importar-carteira-json.md
 */
test.describe('UI-PRT-011', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosForImport(request);
  });

  test('importa carteira a partir do fixture JSON em /dados', async ({ page }) => {
    await gotoDadosPage(page);
    await uploadPortfolioImportFile(page, 'specs/fixtures/e2e-import.carteira.json');
    await clickAnalyzePortfolioImport(page);
    await clickConfirmPortfolioImport(page);
    await expect(page.getByText('Carteira importada com sucesso.')).toBeVisible();
    await expect(page.getByLabel('Selecionar carteira')).toContainText(E2E_PORTFOLIO_IMPORT);
  });
});
