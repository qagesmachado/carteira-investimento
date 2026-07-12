import { expect, test } from '../fixtures/test';

import {
  assetRebalanceTableSection,
  balanceamentoTableSection,
  fillInvestmentAmount,
  gotoRebalancePage
} from '../helpers/rebalancePage';
import { seedRebalanceTwoStocksScored } from '../helpers/seedRebalance';

/**
 * UI-REB-007 — Projeção por ativo com valor a investir
 * @see ../../../casos-de-uso/ui/rebalanceamento/07-patrimonio-final-por-ativo.md
 */
test.describe('UI-REB-007', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceTwoStocksScored(request);
  });

  test('exibe deveria ter e aporte sugerido por ativo ao informar valor a investir', async ({
    page
  }) => {
    await gotoRebalancePage(page);

    await fillInvestmentAmount(page, '10000');

    const assetsSection = assetRebalanceTableSection(page);
    const aaaRow = assetsSection.getByRole('row').filter({ hasText: 'AAA3' });
    await expect(aaaRow).toBeVisible();
    await expect(aaaRow.locator('td').nth(-2)).not.toHaveText('—');
    await expect(aaaRow.locator('td').nth(-1)).not.toHaveText('—');
    await expect(aaaRow.locator('td').nth(-1)).toHaveText(/R\$/);

    await expect(balanceamentoTableSection(page).getByText(/Patrimônio final:/)).toBeVisible();
  });
});
