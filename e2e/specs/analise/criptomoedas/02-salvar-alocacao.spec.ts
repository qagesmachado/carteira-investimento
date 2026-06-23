import { expect, test } from '../../fixtures/test';

import {
  cryptoAnalysisRow,
  gotoCriptomoedasPage,
  saveCryptoAllocation
} from '../../helpers/analisePage';
import { seedCryptoAnalysis } from '../../helpers/seedCryptoAnalysis';
import { TICKER_ABTC11, TICKER_BTC_USD } from '../../helpers/e2eFixtures';

/**
 * UI-CRP-002 — Salvar alocação criptomoedas
 * @see ../../../casos-de-uso/ui/analise/criptomoedas/02-salvar-alocacao-cripto.md
 */
test.describe('UI-CRP-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedCryptoAnalysis(request);
  });

  test('define % 70/30 e salva alocação com soma 100%', async ({ page }) => {
    await gotoCriptomoedasPage(page);
    const btcRow = cryptoAnalysisRow(page, TICKER_BTC_USD);
    await btcRow.locator('input[type="text"]').first().fill('70');
    await btcRow.locator('input[type="text"]').first().blur();
    const abtcRow = cryptoAnalysisRow(page, TICKER_ABTC11);
    await abtcRow.locator('input[type="text"]').first().fill('30');
    await abtcRow.locator('input[type="text"]').first().blur();
    await saveCryptoAllocation(page);
    await expect(page.getByText('100,00%').first()).toBeVisible();
  });
});
