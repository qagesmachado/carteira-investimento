import { test } from '@playwright/test';

import {
  clickRefreshQuotes,
  expectSummaryTotalsForCurrency,
  gotoPortfoliosPage
} from '../helpers/portfoliosPage';
import { seedPortfoliosFullMix } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-020 — Resumo totais por moeda
 * @see ../../../casos-de-uso/ui/portfolios/20-resumo-totais-moeda.md
 */
test.describe('UI-PRT-020', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosFullMix(request);
  });

  test('exibe totais BRL e USD', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await clickRefreshQuotes(page);
    await expectSummaryTotalsForCurrency(page, 'BRL');
    await expectSummaryTotalsForCurrency(page, 'USD');
  });
});
