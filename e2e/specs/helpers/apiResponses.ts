import type { Response } from '@playwright/test';

import { getWorkerApiBaseUrl } from './workerContext';

function apiOrigin(): string {
  return getWorkerApiBaseUrl();
}

export function isApiAssetsListResponse(response: Response, method: 'GET' | 'POST'): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname.replace(/\/$/, '') === '/assets' &&
    response.request().method() === method
  );
}

export function isApiLookupResponse(response: Response): boolean {
  const url = new URL(response.url());
  return url.origin === apiOrigin() && url.pathname === '/assets/lookup';
}

export function isApiPortfoliosListResponse(response: Response, method: 'GET' | 'POST' = 'GET'): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname.replace(/\/$/, '') === '/portfolios' &&
    response.request().method() === method
  );
}

export function isApiPositionsResponse(
  response: Response,
  method: 'GET' | 'POST' | 'PATCH' | 'DELETE' = 'GET',
  portfolioId?: number
): boolean {
  const url = new URL(response.url());
  if (url.origin !== apiOrigin() || !url.pathname.includes('/positions')) {
    return false;
  }
  if (portfolioId != null && !url.pathname.includes(`/portfolios/${portfolioId}/positions`)) {
    return false;
  }
  return response.request().method() === method;
}

export function isApiQuoteRefreshResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    /\/portfolios\/\d+\/quotes\/refresh$/.test(url.pathname) &&
    response.request().method() === 'POST'
  );
}

export function isApiFxGetResponse(response: Response): boolean {
  const url = new URL(response.url());
  return url.origin === apiOrigin() && url.pathname === '/fx/usd-brl' && response.request().method() === 'GET';
}

export function isApiFxRefreshResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/fx/usd-brl/refresh' &&
    response.request().method() === 'POST'
  );
}

export function isApiPortfolioExportResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    /\/portfolios\/\d+\/export$/.test(url.pathname) &&
    response.request().method() === 'GET' &&
    response.ok()
  );
}

export function isApiImportPreviewResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/portfolios/import/preview' &&
    response.request().method() === 'POST'
  );
}

export function isApiImportConfirmResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/portfolios/import' &&
    response.request().method() === 'POST'
  );
}

export function isApiDividendPaymentsListResponse(response: Response, method: 'GET' = 'GET'): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname.replace(/\/$/, '') === '/dividend-payments' &&
    response.request().method() === method
  );
}

export function isApiDividendPaymentPostResponse(response: Response): boolean {
  return isApiDividendPaymentsListResponse(response, 'POST');
}

export function isApiDividendPaymentPatchResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    /^\/dividend-payments\/\d+$/.test(url.pathname) &&
    response.request().method() === 'PATCH'
  );
}

export function isApiDividendPaymentDeleteResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    /^\/dividend-payments\/\d+$/.test(url.pathname) &&
    response.request().method() === 'DELETE'
  );
}

export function isApiDividendBulkPreviewResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    (url.pathname === '/dividend-payments/bulk/preview' ||
      url.pathname === '/data/import/dividends/preview') &&
    response.request().method() === 'POST'
  );
}

export function isApiDividendBulkCreateResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    (url.pathname === '/dividend-payments/bulk' ||
      url.pathname === '/data/import/dividends/confirm') &&
    response.request().method() === 'POST'
  );
}

export function isApiDataAssetsImportPreviewResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/data/import/assets/preview' &&
    response.request().method() === 'POST'
  );
}

export function isApiDataAssetsImportConfirmResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/data/import/assets/confirm' &&
    response.request().method() === 'POST'
  );
}

export function isApiDataExportAssetsResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/data/export/assets' &&
    response.request().method() === 'GET' &&
    response.ok()
  );
}

export function isApiDataExportDividendsResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/data/export/dividends' &&
    response.request().method() === 'GET' &&
    response.ok()
  );
}

export function isApiDataExportFullResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/data/export/full' &&
    response.request().method() === 'GET' &&
    response.ok()
  );
}

export function isApiCryptoAllocationsPutResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/analysis/profiles/crypto/allocations' &&
    response.request().method() === 'PUT'
  );
}

export function isApiEtfIntlAllocationsPutResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/analysis/profiles/etf-intl/allocations' &&
    response.request().method() === 'PUT'
  );
}

export function isApiAnalysisConfigGetResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    (url.pathname === '/analysis/profiles/stock-br/config' ||
      url.pathname === '/analysis/profiles/fii-br/config' ||
      url.pathname === '/analysis/profiles/etf-intl/config' ||
      url.pathname === '/analysis/profiles/crypto/config') &&
    response.request().method() === 'GET'
  );
}

export function isApiAnalysisConfigPutResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    (url.pathname === '/analysis/profiles/stock-br/config' ||
      url.pathname === '/analysis/profiles/fii-br/config') &&
    response.request().method() === 'PUT'
  );
}

export function isApiFiiSegmentsGetResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/analysis/profiles/fii-br/segments' &&
    response.request().method() === 'GET'
  );
}

export function isApiAnalysisAssetsListResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    url.pathname === '/analysis/assets' &&
    response.request().method() === 'GET'
  );
}

export function isApiAnalysisScoresPutResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === apiOrigin() &&
    /^\/analysis\/assets\/\d+\/scores$/.test(url.pathname) &&
    response.request().method() === 'PUT'
  );
}
