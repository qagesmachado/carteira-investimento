import { test } from '../fixtures/test';


import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import {
  expectPositionRow,
  expectPositionRowHidden,
  filterPositionsByText,
  gotoPortfoliosPage
} from '../helpers/portfoliosPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedPortfoliosFullMix } from '../helpers/seedPortfolios';

/**
 * UI-PRT-021 — Filtro por texto na tabela de posições
 * @see ../../../casos-de-uso/ui/portfolios/21-filtro-texto-posicoes.md
 */
test.describe('UI-PRT-021', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosFullMix(request);
  });

  test('filtra tabela por texto BBSE', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await filterPositionsByText(page, 'BBSE');
    await expectPositionRow(page, TICKER_BBSE3);
    await expectPositionRowHidden(page, TICKER_VOO);
  });
});
