import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  addAssetModal,
  fillMarketPosition,
  gotoPortfolioPositions,
  pickAssetInAddForm,
  positionsTable
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalWithBbse3 } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-016 — Impedir posição duplicada
 * @see ../../../casos-de-uso/ui/portfolios/16-posicao-duplicada.md
 */
test.describe('UI-PRT-016', () => {
  let portfolioId = 0;

  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    portfolioId = await seedPortfoliosPrincipalWithBbse3(request);
  });

  test('não permite segunda posição no mesmo ativo', async ({ page }) => {
    await gotoPortfolioPositions(page, portfolioId);
    await pickAssetInAddForm(page, TICKER_BBSE3);
    await fillMarketPosition(page, { quantity: '10', avgPrice: '30' });
    await addAssetModal(page).getByRole('button', { name: 'Adicionar' }).click();
    await expect(
      addAssetModal(page).getByText(/já está nesta carteira/i)
    ).toBeVisible();
    await expect(positionsTable(page).locator('tr').filter({ hasText: TICKER_BBSE3 })).toHaveCount(1);
  });
});
