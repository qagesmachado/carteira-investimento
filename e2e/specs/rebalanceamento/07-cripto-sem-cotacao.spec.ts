import { expect, test } from '../fixtures/test';

import { TICKER_ABTC11 } from '../helpers/e2eFixtures';
import { gotoRebalancePage } from '../helpers/rebalancePage';
import { seedCryptoRebalanceNoQuote } from '../helpers/seedCryptoAnalysis';

/**
 * UI-PRT-007 — Cripto sem cotação aparece no rebalanceamento
 * @see ../../casos-de-uso/ui/rebalanceamento/07-cripto-sem-cotacao.md
 */
test.describe('UI-PRT-007', () => {
  test.beforeEach(async ({ request }) => {
    await seedCryptoRebalanceNoQuote(request);
  });

  test('aba Criptomoedas lista ativo sem cotação com travessões em valor e % atual', async ({
    page
  }) => {
    await gotoRebalancePage(page);
    const section = page.locator('section').filter({ hasText: 'Por ativo' });
    await section.getByRole('tab', { name: 'Criptomoedas' }).click();

    const abtcRow = section.locator('table tbody tr').filter({ hasText: TICKER_ABTC11 }).first();
    await expect(abtcRow).toBeVisible();
    await expect(abtcRow.locator('td').nth(2)).toHaveText('—');
    await expect(abtcRow.locator('td').nth(3)).toHaveText('—');
    await expect(abtcRow.locator('td').nth(4)).toContainText('60');
  });
});
