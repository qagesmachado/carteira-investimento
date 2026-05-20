import { expect, type Locator, type Page } from '@playwright/test';

import {
  isApiAssetsListResponse,
  isApiDividendPaymentsListResponse,
  isApiFxGetResponse,
  isApiPortfoliosListResponse,
  isApiPositionsResponse
} from './apiResponses';

export async function gotoDashboardPage(page: Page): Promise<void> {
  const portfoliosResponse = page.waitForResponse(
    (r) => isApiPortfoliosListResponse(r, 'GET') && r.ok()
  );
  const assetsResponse = page.waitForResponse(
    (r) => isApiAssetsListResponse(r, 'GET') && r.ok()
  );
  const dividendsResponse = page
    .waitForResponse((r) => isApiDividendPaymentsListResponse(r, 'GET') && r.ok())
    .catch(() => null);
  const fxResponse = page.waitForResponse((r) => isApiFxGetResponse(r) && r.ok()).catch(() => null);

  await page.goto('/dashboard');
  await portfoliosResponse;
  await assetsResponse;
  await dividendsResponse;
  await fxResponse;
  await page
    .waitForResponse((r) => isApiPositionsResponse(r, 'GET') && r.ok())
    .catch(() => null);
}

export function dashboardPortfolioSelect(page: Page) {
  return page.getByLabel('Selecionar carteira');
}

export async function expectEmptyDashboardMessage(page: Page): Promise<void> {
  await expect(page.getByText(/Crie ou selecione uma carteira/i)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Carteiras' })).toBeVisible();
}

export async function expectDashboardCardsVisible(page: Page): Promise<void> {
  await expect(page.getByText('Patrimônio total')).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Alocação por classe' })).toBeVisible();
  await expect(page.getByRole('heading', { name: 'Top ativos' })).toBeVisible();
}

export async function waitForPositionsAfterPortfolioChange(page: Page): Promise<void> {
  await page.waitForResponse((r) => isApiPositionsResponse(r, 'GET') && r.ok());
}

export async function clickRefreshQuotes(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Atualizar cotações' }).click();
}

export async function clickRefreshFx(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Atualizar câmbio (USD/BRL)' }).click();
}

export function allocationSection(page: Page): Locator {
  return page.locator('section[aria-label="Alocação por classe"]');
}

export function topAssetsSection(page: Page): Locator {
  return page.locator('section[aria-label="Top ativos"]');
}

export async function switchAllocationView(page: Page, mode: 'Barras' | 'Pizza'): Promise<void> {
  await allocationSection(page).getByRole('button', { name: mode }).click();
}
