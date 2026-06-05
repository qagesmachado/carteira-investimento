import type { APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import { E2E_PORTFOLIO_PRINCIPAL, TICKER_BTC_USD } from './e2eFixtures';
import { clearAllTestAssets, seedAssetFromLookup } from './seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from './testPortfolios';

export async function seedConsolidadaBitcoinWithFee(
  request: APIRequestContext
): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BTC_USD);

  const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
  const btcId = await getAssetIdBySymbol(request, TICKER_BTC_USD);

  await createPosition(request, portfolio.id, btcId, {
    quantity: 0.01491742,
    average_price: 80988.55
  });

  const feeResponse = await request.post(`${getWorkerApiBaseUrl()}/crypto-fees`, {
    headers: { 'Content-Type': 'application/json' },
    data: {
      portfolio_id: portfolio.id,
      asset_id: btcId,
      fee_type: 'purchase',
      fee_date: '2025-06-26',
      quantity_moved: 0.00084,
      fee_quantity_btc: 0.00000084,
      quote_brl: 590867,
      fx_rate: 5.54
    }
  });
  if (!feeResponse.ok()) {
    throw new Error(`crypto-fees seed failed: ${feeResponse.status()} ${await feeResponse.text()}`);
  }

  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}
