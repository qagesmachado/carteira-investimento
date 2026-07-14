import { expect, test } from '../fixtures/test';


import {
  acceptDialogs,
  clickRemovePosition,
  gotoPortfolioPositions,
  positionsTable
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalWithFlry3Disposable } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-008 — Remover posição
 * @see ../../../casos-de-uso/ui/portfolios/08-remover-posicao.md
 */
test.describe('UI-PRT-008', () => {
  let portfolioId = 0;

  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    portfolioId = await seedPortfoliosPrincipalWithFlry3Disposable(request);
  });

  test('remove posição após confirmar', async ({ page }) => {
    acceptDialogs(page);
    await gotoPortfolioPositions(page, portfolioId);
    await clickRemovePosition(page, 'FLRY3');
    await expect(positionsTable(page).locator('tr').filter({ hasText: 'FLRY3' })).toHaveCount(0);
    await expect(page.getByRole('alert').filter({ hasText: 'Posição removida.' })).toBeVisible();
  });
});
