import { expect, test } from '../../fixtures/test';

import { gotoRebalancePage } from '../../helpers/rebalancePage';
import { saveCryptoAllocationViaApi, seedCryptoAnalysis } from '../../helpers/seedCryptoAnalysis';
import { TICKER_ABTC11, TICKER_BTC_USD } from '../../helpers/e2eFixtures';
import { getWorkerApiBaseUrl } from '../../helpers/workerContext';

/**
 * UI-CRP-003 — Rebalanceamento reflete alocação cripto
 * @see ../../../casos-de-uso/ui/analise/criptomoedas/03-rebalance-reflete-alocacao-cripto.md
 */
test.describe('UI-CRP-003', () => {
  test('aba Criptomoedas exibe % desejada após alocação', async ({ page, request }) => {
    const portfolioId = await seedCryptoAnalysis(request);
    const assets = await request.get(`${getWorkerApiBaseUrl()}/assets`);
    const list = (await assets.json()) as { id: number; symbol: string }[];
    const btc = list.find((a) => a.symbol === TICKER_BTC_USD);
    const abtc = list.find((a) => a.symbol === TICKER_ABTC11);
    if (!btc || !abtc) throw new Error('crypto assets not found');
    await saveCryptoAllocationViaApi(request, portfolioId, [
      { asset_id: btc.id, target_percent: 70 },
      { asset_id: abtc.id, target_percent: 30 }
    ]);

    await gotoRebalancePage(page);
    const section = page.locator('section').filter({ hasText: 'Por ativo' });
    await section.getByRole('tab', { name: 'Criptomoedas' }).click();
    const btcRow = section.locator('table tbody tr').filter({ hasText: TICKER_BTC_USD }).first();
    await expect(btcRow.locator('td').nth(4)).toContainText('70');
    const abtcRow = section.locator('table tbody tr').filter({ hasText: TICKER_ABTC11 }).first();
    await expect(abtcRow.locator('td').nth(4)).toContainText('30');
  });
});
