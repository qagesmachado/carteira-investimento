import { expect, test } from '@playwright/test';

import {
  clickFiiAnalysisColumnSort,
  fiiAnalysisDataRows,
  gotoFiisPage
} from '../../helpers/analisePage';
import { assertYfinanceLookupBackend } from '../../helpers/lookupEnv';
import { seedAnalysisWithTwoFiis } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-015 — Ordenação de colunas na tabela de FIIs
 * @see ../../../casos-de-uso/ui/analise/fiis/15-ordenacao-colunas.md
 */
test.describe('UI-ANL-015', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedAnalysisWithTwoFiis(request);
  });

  test('ordena coluna Ticker ao clicar no cabeçalho', async ({ page }) => {
    await gotoFiisPage(page);
    const rows = fiiAnalysisDataRows(page);
    await expect(rows).toHaveCount(2);

    await clickFiiAnalysisColumnSort(page, 'Ticker');
    const firstAsc = (await rows.first().locator('td').first().innerText()).trim();

    await clickFiiAnalysisColumnSort(page, 'Ticker');
    const firstDesc = (await rows.first().locator('td').first().innerText()).trim();

    expect(firstAsc).not.toBe(firstDesc);
  });
});
