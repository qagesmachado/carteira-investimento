import type { APIRequestContext } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';
import { TICKER_BTC_USD } from './e2eFixtures';
import { clearAllTestAssets, seedAssetFromLookup } from './seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from './testPortfolios';

export async function seedBitcoinPortfolio(request: APIRequestContext): Promise<number> {
  await clearAllTestAssets(request, getWorkerApiBaseUrl());
  await clearAllPortfolios(request);
  await seedAssetFromLookup(request, TICKER_BTC_USD);

  const portfolio = await createPortfolio(request, 'E2E Bitcoin');
  const btcId = await getAssetIdBySymbol(request, TICKER_BTC_USD);

  await createPosition(request, portfolio.id, btcId, {
    quantity: 0.01491742,
    average_price: 83521.5048
  });
  await setActivePortfolio(request, portfolio.id);
  return portfolio.id;
}
