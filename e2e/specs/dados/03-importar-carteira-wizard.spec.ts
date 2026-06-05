import { expect, test } from '../fixtures/test';


import {
  clickAnalyzePortfolioImport,
  clickConfirmPortfolioImport,
  gotoDadosPage,
  uploadPortfolioImportFile
} from '../helpers/dataPage';
import { E2E_PORTFOLIO_IMPORT } from '../helpers/e2eFixtures';
import { gotoPortfoliosPage, positionsTable } from '../helpers/portfoliosPage';
import { seedPortfoliosForImport } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-DAD-003 — Importar carteira via wizard em /dados
 * @see ../../../casos-de-uso/ui/dados/03-importar-carteira-wizard.md
 */
test.describe('UI-DAD-003', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosForImport(request);
  });

  test('importa carteira a partir do fixture JSON', async ({ page }) => {
    await gotoDadosPage(page);
    await uploadPortfolioImportFile(page, 'specs/fixtures/e2e-import.carteira.json');
    await clickAnalyzePortfolioImport(page);
    await clickConfirmPortfolioImport(page);
    await expect(page.getByText('Carteira importada com sucesso.')).toBeVisible();

    await gotoPortfoliosPage(page);
    await expect(page.getByRole('button', { name: new RegExp(E2E_PORTFOLIO_IMPORT) })).toBeVisible();
    await expect(page.locator('.badge', { hasText: 'ativa' })).toBeVisible();
    await expect(positionsTable(page).locator('tr')).not.toHaveCount(0);
  });
});
