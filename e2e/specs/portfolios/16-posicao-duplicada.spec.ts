import { expect, test } from '@playwright/test';

import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  fillMarketPosition,
  gotoPortfoliosPage,
  pickAssetInAddForm,
  positionsSection,
  positionsTable
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalWithBbse3 } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-016 — Impedir posição duplicada
 * @see ../../../casos-de-uso/ui/portfolios/16-posicao-duplicada.md
 */
test.describe('UI-PRT-016', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosPrincipalWithBbse3(request);
  });

  test('não permite segunda posição no mesmo ativo', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await pickAssetInAddForm(page, TICKER_BBSE3);
    await fillMarketPosition(page, { quantity: '10', avgPrice: '30' });
    await positionsSection(page).getByRole('button', { name: 'Adicionar' }).click();
    await expect(
      page.getByRole('alert').filter({ hasText: /Este ativo já está nesta carteira/i })
    ).toBeVisible();
    await expect(positionsTable(page).locator('tr').filter({ hasText: TICKER_BBSE3 })).toHaveCount(1);
  });
});
