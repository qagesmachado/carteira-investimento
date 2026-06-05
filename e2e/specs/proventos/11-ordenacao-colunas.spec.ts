import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3, TICKER_VOO } from '../helpers/e2eFixtures';
import {
  clickSortColumn,
  gotoProventosPage,
  paymentsTable
} from '../helpers/proventosPage';
import { seedProventosForSort } from '../helpers/seedProventos';

/**
 * UI-PRV-011 — Ordenar colunas da tabela
 * @see ../../../casos-de-uso/ui/proventos/11-ordenacao-colunas.md
 */
test.describe('UI-PRV-011', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosForSort(request);
  });

  test('alterna ordem ao clicar nos cabeçalhos', async ({ page }) => {
    await gotoProventosPage(page);

    await clickSortColumn(page, 'Data');
    const datesAsc = await paymentsTable(page).locator('tr td').first().allTextContents();
    expect(datesAsc[0]).toMatch(/15\/01\/2024|15\/06\/2024|01\/12\/2024/);

    await clickSortColumn(page, 'Valor');
    const firstAmountRow = paymentsTable(page).locator('tr').first();
    await expect(firstAmountRow).toContainText(/90|60|30/);

    await clickSortColumn(page, 'Ativo');
    const firstSymbol = await paymentsTable(page).locator('tr td').nth(1).first().textContent();
    expect(firstSymbol?.trim()).toMatch(new RegExp(`${TICKER_BBSE3}|${TICKER_VOO}`));
  });
});
