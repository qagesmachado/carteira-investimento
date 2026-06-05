import { expect, test } from '../fixtures/test';


import { gotoPortfoliosPage } from '../helpers/portfoliosPage';
import { seedPortfoliosEmptyAssetsOnly } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-001 — Carregamento de carteiras
 * @see ../../../casos-de-uso/ui/portfolios/01-carregamento-carteiras.md
 */
test.describe('UI-PRT-001', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosEmptyAssetsOnly(request);
  });

  test('página carrega sem carteiras na base de teste', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await expect(page.getByRole('heading', { name: 'Carteiras e posições' })).toBeVisible();
    await expect(page.getByText('Nenhuma carteira ainda.')).toBeVisible();
    await expect(page.getByText('Selecione ou crie uma carteira.')).toBeVisible();
    await expect(page.locator('[role="alert"].alert-error')).toHaveCount(0);
  });
});
