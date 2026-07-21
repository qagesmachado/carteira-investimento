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
  // Registrar opcionais ANTES do goto para não perder a corrida com o carregamento.
  const dividendsResponse = page
    .waitForResponse((r) => isApiDividendPaymentsListResponse(r, 'GET') && r.ok(), {
      timeout: 15_000
    })
    .catch(() => null);
  const fxResponse = page
    .waitForResponse((r) => isApiFxGetResponse(r) && r.ok(), { timeout: 15_000 })
    .catch(() => null);
  const positionsResponse = page
    .waitForResponse((r) => isApiPositionsResponse(r, 'GET') && r.ok(), { timeout: 15_000 })
    .catch(() => null);

  await page.goto('/dashboard');
  await Promise.all([portfoliosResponse, assetsResponse]);
  await Promise.all([dividendsResponse, fxResponse, positionsResponse]);
}

export function dashboardPortfolioSelect(page: Page) {
  return page.getByTestId('dashboard-portfolio-select');
}

export function dashboardPortfolioBar(page: Page): Locator {
  return page.getByTestId('dashboard-portfolio-bar');
}

export function dashboardFxBadge(page: Page): Locator {
  return page.getByTestId('dashboard-fx-badge');
}

export function dashboardQuotesBadge(page: Page): Locator {
  return page.getByTestId('dashboard-quotes-badge');
}

export async function expectEmptyDashboardMessage(page: Page): Promise<void> {
  const cta = page.getByTestId('dashboard-sem-carteira-cta');
  await expect(cta).toBeVisible();
  await expect(cta).toHaveAttribute('href', '/portfolios');
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
  await page.getByRole('button', { name: /Atualizar câmbio/i }).click();
}

export function dividends12MonthSection(page: Page): Locator {
  return page.getByTestId('dashboard-dividends-12m');
}

export function dashboardHighlightsSection(page: Page): Locator {
  return page.getByTestId('dashboard-highlights-row');
}

export function dashboardShortcutBar(page: Page): Locator {
  return page.getByTestId('dashboard-shortcut-bar');
}

export function allocationSection(page: Page): Locator {
  return page.locator('section[aria-label="Alocação por classe"]');
}

export function topAssetsSection(page: Page): Locator {
  return page.locator('section[aria-label="Top ativos"]');
}

export function dashboardKpiPositions(page: Page): Locator {
  return page.getByTestId('dashboard-kpi-positions');
}

export function dashboardPatrimonyFilters(page: Page): Locator {
  return page.getByTestId('dashboard-kpi-patrimony').getByTestId('dashboard-patrimony-filters');
}

export async function toggleDashboardPensionFilter(page: Page, checked: boolean): Promise<void> {
  const input = page.getByTestId('dashboard-kpi-patrimony').getByTestId('dashboard-filter-pension');
  if (checked) {
    await input.check();
  } else {
    await input.uncheck();
  }
}
