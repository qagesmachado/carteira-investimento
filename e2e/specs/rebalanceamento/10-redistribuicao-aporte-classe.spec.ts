import { expect, test } from '../fixtures/test';

import {
  balanceamentoTableSection,
  fillInvestmentAmount,
  gotoRebalancePage,
  toggleClassInclusion
} from '../helpers/rebalancePage';
import { seedRebalanceWithMix } from '../helpers/seedRebalance';

function parseBrl(text: string): number {
  const normalized = text
    .replace(/\u00a0/g, ' ')
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  return Number.parseFloat(normalized);
}

/**
 * UI-REB-010 — Redistribuição de aporte ao excluir classe
 * @see ../../../casos-de-uso/ui/rebalanceamento/10-redistribuicao-aporte-classe.md
 */
test.describe('UI-REB-010', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceWithMix(request);
  });

  test('redistribui aporte ao desmarcar classe', async ({ page }) => {
    await gotoRebalancePage(page);
    const table = balanceamentoTableSection(page);
    await fillInvestmentAmount(page, '10000');

    const intlRow = table.getByRole('row').filter({ hasText: 'Internacional' });
    const stocksRow = table.getByRole('row').filter({ hasText: 'Ações/ETF BR' });
    const stocksBefore = parseBrl(await stocksRow.locator('td').nth(10).innerText());

    await toggleClassInclusion(page, 'Internacional', false);

    await expect(intlRow.locator('td').nth(10)).toHaveText(/R\$\s*0,00/);

    const stocksAfter = parseBrl(await stocksRow.locator('td').nth(10).innerText());
    expect(stocksAfter).toBeGreaterThan(stocksBefore);

    const dataRows = table.locator('tbody tr').filter({ hasNotText: 'TOTAL' });
    const rowCount = await dataRows.count();
    let totalAporte = 0;
    for (let index = 0; index < rowCount; index++) {
      totalAporte += parseBrl(await dataRows.nth(index).locator('td').nth(10).innerText());
    }
    expect(totalAporte).toBeCloseTo(10_000, 2);
  });
});
