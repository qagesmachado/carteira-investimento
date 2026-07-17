import { expect, test } from '../../fixtures/test';

import { cryptoAnalysisRow, gotoCriptomoedasPage } from '../../helpers/analisePage';
import {
  E2E_PORTFOLIO_PRINCIPAL,
  E2E_PORTFOLIO_SECONDARY,
  TICKER_ABTC11,
  TICKER_BTC_USD
} from '../../helpers/e2eFixtures';
import { clearAllTestAssets, createAssetViaApi } from '../../helpers/seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  setActivePortfolio
} from '../../helpers/testPortfolios';
import { saveCryptoAllocationViaApi } from '../../helpers/seedCryptoAnalysis';
import { getWorkerApiBaseUrl } from '../../helpers/workerContext';

/**
 * UI-CRP-004 — Alocação cripto isolada por carteira
 * @see ../../../casos-de-uso/ui/analise/criptomoedas/04-isolamento-por-carteira.md
 */
test.describe('UI-CRP-004', () => {
  test('trocar carteira exibe % desejada distinta', async ({ page, request }) => {
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
    await clearAllPortfolios(request);

    await createAssetViaApi(request, {
      symbol: TICKER_BTC_USD,
      name: 'Bitcoin USD',
      asset_type: 'crypto',
      market: 'international',
      country: 'US',
      currency: 'USD',
      current_quote: 65000
    });
    await createAssetViaApi(request, {
      symbol: TICKER_ABTC11,
      name: 'ETF Bitcoin',
      asset_type: 'etf',
      market: 'national',
      country: 'BR',
      currency: 'BRL',
      etf_subtype: 'crypto',
      current_quote: 50
    });

    const assets = (await (
      await request.get(`${getWorkerApiBaseUrl()}/assets`)
    ).json()) as { id: number; symbol: string }[];
    const btc = assets.find((a) => a.symbol === TICKER_BTC_USD);
    const abtc = assets.find((a) => a.symbol === TICKER_ABTC11);
    if (!btc || !abtc) throw new Error('crypto assets not found');

    const portfolioA = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
    const portfolioB = await createPortfolio(request, E2E_PORTFOLIO_SECONDARY);
    await createPosition(request, portfolioA.id, btc.id, { quantity: 0.1, average_price: 60000 });
    await createPosition(request, portfolioA.id, abtc.id, { quantity: 100, average_price: 45 });
    await createPosition(request, portfolioB.id, abtc.id, { quantity: 10, average_price: 45 });
    await setActivePortfolio(request, portfolioA.id);
    await request.post(`${getWorkerApiBaseUrl()}/fx/usd-brl/refresh`);

    await saveCryptoAllocationViaApi(request, portfolioA.id, [
      { asset_id: btc.id, target_percent: 70 },
      { asset_id: abtc.id, target_percent: 30 }
    ]);
    await saveCryptoAllocationViaApi(request, portfolioB.id, [
      { asset_id: abtc.id, target_percent: 100 }
    ]);

    await gotoCriptomoedasPage(page);
    await expect(cryptoAnalysisRow(page, TICKER_BTC_USD).locator('input[type="text"]').first()).toHaveValue(
      '70,00'
    );
    await expect(cryptoAnalysisRow(page, TICKER_ABTC11).locator('input[type="text"]').first()).toHaveValue(
      '30,00'
    );

    const reloadResponse = page.waitForResponse(
      (r) =>
        r.url().includes('/analysis/assets?profile=crypto') &&
        r.url().includes(`portfolio_id=${portfolioB.id}`) &&
        r.ok()
    );
    await page.getByRole('combobox', { name: 'Selecionar carteira' }).selectOption({
      label: E2E_PORTFOLIO_SECONDARY
    });
    await reloadResponse;

    await expect(cryptoAnalysisRow(page, TICKER_BTC_USD)).toHaveCount(0);
    await expect(cryptoAnalysisRow(page, TICKER_ABTC11).locator('input[type="text"]').first()).toHaveValue(
      '100,00'
    );
  });
});
