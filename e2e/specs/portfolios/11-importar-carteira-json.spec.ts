import { expect, test } from '@playwright/test';

import { E2E_PORTFOLIO_IMPORT } from '../helpers/e2eFixtures';
import {
  clickAnalyzeImport,
  clickConfirmImport,
  gotoPortfoliosPage,
  uploadImportFile
} from '../helpers/portfoliosPage';
import { seedPortfoliosForImport } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-011 — Importar carteira JSON
 * @see ../../../casos-de-uso/ui/portfolios/11-importar-carteira-json.md
 */
test.describe('UI-PRT-011', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosForImport(request);
  });

  test('importa carteira a partir do fixture JSON', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await uploadImportFile(page, 'specs/fixtures/e2e-import.carteira.json');
    await clickAnalyzeImport(page);
    await clickConfirmImport(page);
    await expect(page.getByRole('button', { name: E2E_PORTFOLIO_IMPORT })).toBeVisible();
  });
});
