import { expect, test } from '../fixtures/test';


import {
  clickPositionsColumnSort,
  gotoPortfoliosPage,
  positionDataRows
} from '../helpers/portfoliosPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedPortfoliosFullMix } from '../helpers/seedPortfolios';

/**
 * UI-PRT-022 — Ordenação de colunas na tabela de posições
 * @see ../../../casos-de-uso/ui/portfolios/22-ordenacao-colunas-posicoes.md
 */
test.describe('UI-PRT-022', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosFullMix(request);
  });

  test('ordena coluna Ativo ao clicar no cabeçalho', async ({ page }) => {
    await gotoPortfoliosPage(page);
    const rows = positionDataRows(page);
    await expect(rows).not.toHaveCount(0);

    await clickPositionsColumnSort(page, 'Ativo');
    const firstAsc = (await rows.first().locator('td').first().innerText()).trim();

    await clickPositionsColumnSort(page, 'Ativo');
    const firstDesc = (await rows.first().locator('td').first().innerText()).trim();

    expect(firstAsc).not.toBe(firstDesc);
  });
});
