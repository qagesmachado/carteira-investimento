import { expect, test } from '../../fixtures/test';

import {
  expectAveragePriceResult,
  fillManualLots,
  gotoCalculoPrecoMedioPage,
  selectManualTab
} from '../../helpers/calculoPrecoMedioPage';

/**
 * UI-FERR-008 — Cálculo manual de preço médio
 * @see ../../../casos-de-uso/ui/calculo-preco-medio/01-calculo-manual.md
 */
test.describe('UI-FERR-008', () => {
  test('calcula preço médio ponderado no modo manual', async ({ page }) => {
    await gotoCalculoPrecoMedioPage(page);
    await selectManualTab(page);
    await fillManualLots(page, {
      lot1Quantity: '100',
      lot1Price: '30',
      lot2Quantity: '50',
      lot2Price: '35'
    });
    await expectAveragePriceResult(page, {
      totalQuantity: '150',
      averagePrice: /31,67/
    });
  });
});
