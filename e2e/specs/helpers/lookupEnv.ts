import type { APIRequestContext } from '@playwright/test';

import { test } from '../fixtures/test';
import { getWorkerApiBaseUrl } from './workerContext';
import { TICKER_BBSE3 } from './e2eFixtures';

type LookupPayload = {
  name?: string;
  asset_type?: string;
  market?: string;
  currency?: string;
  sector?: string;
};

export async function assertYfinanceLookupBackend(request: APIRequestContext): Promise<void> {
  const lookupResponse = await request
    .get(`${getWorkerApiBaseUrl()}/assets/lookup?symbol=${TICKER_BBSE3}`, { timeout: 45_000 })
    .catch(() => null);

  if (!lookupResponse?.ok()) {
    test.skip(
      true,
      `Lookup yfinance indisponível em ${getWorkerApiBaseUrl()}. Verifique rede ou rode npm run test:ui.`
    );
  }

  const lookup = (await lookupResponse.json()) as LookupPayload;

  if (
    lookup.asset_type !== 'stock' ||
    lookup.currency !== 'BRL' ||
    lookup.market !== 'national' ||
    !lookup.name?.trim()
  ) {
    test.skip(
      true,
      `Resposta yfinance para ${TICKER_BBSE3} inesperada. Confirme ASSET_LOOKUP_MODE=yfinance no backend E2E.`
    );
  }
}
