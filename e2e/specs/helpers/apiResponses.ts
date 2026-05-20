import type { Response } from '@playwright/test';

const { E2E_API_BASE_URL: API_BASE_URL } = require('../../test-env');

export function isApiAssetsListResponse(response: Response, method: 'GET' | 'POST'): boolean {
  const url = new URL(response.url());
  return (
    url.origin === API_BASE_URL &&
    url.pathname.replace(/\/$/, '') === '/assets' &&
    response.request().method() === method
  );
}

export function isApiLookupResponse(response: Response): boolean {
  const url = new URL(response.url());
  return url.origin === API_BASE_URL && url.pathname === '/assets/lookup';
}

export function isApiPortfoliosListResponse(response: Response, method: 'GET' | 'POST' = 'GET'): boolean {
  const url = new URL(response.url());
  return (
    url.origin === API_BASE_URL &&
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
  if (url.origin !== API_BASE_URL || !url.pathname.includes('/positions')) {
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
    url.origin === API_BASE_URL &&
    /\/portfolios\/\d+\/quotes\/refresh$/.test(url.pathname) &&
    response.request().method() === 'POST'
  );
}

export function isApiFxGetResponse(response: Response): boolean {
  const url = new URL(response.url());
  return url.origin === API_BASE_URL && url.pathname === '/fx/usd-brl' && response.request().method() === 'GET';
}

export function isApiFxRefreshResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === API_BASE_URL &&
    url.pathname === '/fx/usd-brl/refresh' &&
    response.request().method() === 'POST'
  );
}

export function isApiPortfolioExportResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === API_BASE_URL &&
    /\/portfolios\/\d+\/export$/.test(url.pathname) &&
    response.request().method() === 'GET' &&
    response.ok()
  );
}

export function isApiImportPreviewResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === API_BASE_URL &&
    url.pathname === '/portfolios/import/preview' &&
    response.request().method() === 'POST'
  );
}

export function isApiImportConfirmResponse(response: Response): boolean {
  const url = new URL(response.url());
  return (
    url.origin === API_BASE_URL &&
    url.pathname === '/portfolios/import' &&
    response.request().method() === 'POST'
  );
}

export { API_BASE_URL };
