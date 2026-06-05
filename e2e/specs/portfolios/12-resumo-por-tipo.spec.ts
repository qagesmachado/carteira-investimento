import { test } from '../fixtures/test';


import { expectSummaryByType, gotoPortfoliosPage } from '../helpers/portfoliosPage';
import { seedPortfoliosFullMix } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-012 — Resumo por tipo
 * @see ../../../casos-de-uso/ui/portfolios/12-resumo-por-tipo.md
 */
test.describe('UI-PRT-012', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosFullMix(request);
  });

  test('exibe resumo por tipo de ativo', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await expectSummaryByType(page);
  });
});
