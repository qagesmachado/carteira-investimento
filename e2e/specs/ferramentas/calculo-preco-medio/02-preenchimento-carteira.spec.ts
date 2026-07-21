import { test } from '../../fixtures/test';

import {
  expectAveragePriceResult,
  fillPortfolioLot2,
  gotoCalculoPrecoMedioPage,
  selectPortfolioPosition,
  selectPortfolioTab
} from '../../helpers/calculoPrecoMedioPage';
import { seedPortfoliosPrincipalWithBbse3 } from '../../helpers/seedPortfolios';

/**
 * UI-FERR-009 — Pré-preenchimento com posição da carteira
 * @see ../../../casos-de-uso/ui/calculo-preco-medio/02-preenchimento-carteira.md
 */
test.describe('UI-FERR-009', () => {
  test.beforeEach(async ({ request }) => {
    await seedPortfoliosPrincipalWithBbse3(request);
  });

  test('usa posição BBSE3 como Lote 1 e calcula novo preço médio', async ({ page }) => {
    await gotoCalculoPrecoMedioPage(page);
    await selectPortfolioTab(page);
    await selectPortfolioPosition(page, 'BBSE3');
    await fillPortfolioLot2(page, { quantity: '50', price: '35' });
    await expectAveragePriceResult(page, {
      totalQuantity: '150',
      averagePrice: /33,33/
    });
  });
});
