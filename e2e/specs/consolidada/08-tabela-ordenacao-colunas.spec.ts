import { expect, test } from '../fixtures/test';


import { clickColumnSort, dataRows, gotoConsolidadaPage } from '../helpers/consolidadaPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-008 — Ordenação de colunas na tabela
 * @see ../../../casos-de-uso/ui/consolidada/08-tabela-ordenacao-colunas.md
 */
test.describe('UI-CNS-008', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('ordena coluna Ativo ao clicar no cabeçalho', async ({ page }) => {
    await gotoConsolidadaPage(page);
    const rows = dataRows(page);
    await expect(rows).not.toHaveCount(0);

    await clickColumnSort(page, 'Ativo');
    const firstAsc = (await rows.first().locator('td').first().innerText()).trim();

    await clickColumnSort(page, 'Ativo');
    const firstDesc = (await rows.first().locator('td').first().innerText()).trim();

    expect(firstAsc).not.toBe(firstDesc);
  });
});
