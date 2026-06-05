import { expect, test } from '../fixtures/test';


import { E2E_PENSION_IDENTIFIER } from '../helpers/e2eFixtures';
import {
  clickAddPosition,
  fillManualPosition,
  gotoPortfoliosPage,
  pickAssetInAddForm,
  expectPositionRow
} from '../helpers/portfoliosPage';
import { seedPortfoliosWithPension } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-017 — Adicionar posição de previdência
 * @see ../../../casos-de-uso/ui/portfolios/17-adicionar-posicao-previdencia.md
 */
test.describe('UI-PRT-017', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosWithPension(request);
  });

  test('adiciona posição de previdência manual', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await pickAssetInAddForm(page, E2E_PENSION_IDENTIFIER);
    await fillManualPosition(page, {
      invested: '50000',
      current: '52000',
      yield: '100% CDI'
    });
    await clickAddPosition(page);
    await expectPositionRow(page, E2E_PENSION_IDENTIFIER);
  });
});
