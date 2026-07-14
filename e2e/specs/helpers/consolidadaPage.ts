import { expect, type Page } from '@playwright/test';

import {
  isApiAssetsListResponse,
  isApiFxGetResponse,
  isApiPortfoliosListResponse,
  isApiPositionsResponse
} from './apiResponses';
import { E2E_PORTFOLIO_PRINCIPAL, E2E_PORTFOLIO_SECONDARY } from './e2eFixtures';

export async function gotoConsolidadaPage(page: Page): Promise<void> {
  const portfoliosResponse = page.waitForResponse(
    (r) => isApiPortfoliosListResponse(r, 'GET') && r.ok()
  );
  const assetsResponse = page.waitForResponse(
    (r) => isApiAssetsListResponse(r, 'GET') && r.ok()
  );
  const fxResponse = page.waitForResponse((r) => isApiFxGetResponse(r) && r.ok()).catch(() => null);

  await page.goto('/consolidada');
  await portfoliosResponse;
  await assetsResponse;
  await fxResponse;
}

export function activePortfolioSelect(page: Page) {
  return page.getByTestId('dashboard-portfolio-select');
}

export function positionsTable(page: Page) {
  return page.getByTestId('consolidada-positions-table').locator('tbody');
}

export function dataRows(page: Page) {
  return positionsTable(page).locator('tr').filter({ hasNotText: 'Nenhuma posição com os filtros atuais.' });
}

export async function filterByText(page: Page, text: string): Promise<void> {
  await page.getByTestId('consolidada-filter-text').fill(text);
}

export async function filterByAssetType(page: Page, label: string): Promise<void> {
  await page.getByTestId('consolidada-filter-asset-type').selectOption({ label });
}

export async function filterByDisplayClass(page: Page, label: string): Promise<void> {
  await page.getByTestId('consolidada-filter-display-class').selectOption({ label });
}

export async function filterByCurrency(page: Page, text: string): Promise<void> {
  await page.getByTestId('consolidada-filter-currency').fill(text);
}

export async function clearTextFilter(page: Page): Promise<void> {
  await page.getByTestId('consolidada-filter-text').fill('');
}

export async function clickRefreshFx(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Atualizar câmbio' }).click();
}

export async function clickRefreshQuotes(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Atualizar cotações' }).click();
}

export async function clickPositionDetails(page: Page, ticker: string): Promise<void> {
  const row = dataRows(page)
    .filter({ hasText: ticker })
    .filter({ has: page.getByRole('button', { name: 'Detalhes' }) });
  await row.getByRole('button', { name: 'Detalhes' }).click();
}

export async function expectPositionDetailsVisible(page: Page, text: string | RegExp): Promise<void> {
  await expect(page.locator('[role="region"]').filter({ hasText: text })).toBeVisible();
}

export async function expectRowVisible(page: Page, ticker: string): Promise<void> {
  await expect(dataRows(page).filter({ hasText: ticker }).first()).toBeVisible();
}

export async function expectRowHidden(page: Page, ticker: string): Promise<void> {
  await expect(dataRows(page).filter({ hasText: ticker })).toHaveCount(0);
}

export async function expectSummaryCardsVisible(page: Page): Promise<void> {
  await expect(page.getByTestId('consolidada-filter-totals')).toBeVisible();
  await expect(page.getByText('Total aplicado (filtro atual)')).toBeVisible();
}

export async function expectSummaryCardsHidden(page: Page): Promise<void> {
  await expect(page.getByTestId('consolidada-filter-totals')).not.toBeVisible();
}

export async function clearConsolidadaFilters(page: Page): Promise<void> {
  await page.getByTestId('consolidada-clear-filters').click();
}

export async function toggleConsolidadaPensionFilter(page: Page, checked: boolean): Promise<void> {
  const input = page.getByTestId('consolidada-filter-pension');
  if (checked) {
    await input.check();
  } else {
    await input.uncheck();
  }
}

export async function expectTickerPillVisible(page: Page, ticker: string): Promise<void> {
  await expect(page.getByTestId('consolidada-positions-table')).toBeVisible();
  await expect(page.getByTestId(`consolidada-ticker-pill-${ticker}`)).toBeVisible();
}

export async function expectEmptyPortfolioMessage(page: Page): Promise<void> {
  await expect(
    page.getByText('Crie ou selecione uma carteira em').filter({ has: page.getByRole('link', { name: 'Carteiras' }) })
  ).toBeVisible();
}

export async function selectPortfolioByName(page: Page, name: string): Promise<void> {
  const positionsWait = page
    .waitForResponse((r) => isApiPositionsResponse(r) && r.ok(), { timeout: 15_000 })
    .catch(() => null);
  await activePortfolioSelect(page).selectOption({ label: name });
  await positionsWait;
}

export async function clickColumnSort(page: Page, column: string): Promise<void> {
  await page.getByRole('button', { name: column }).click();
}

export async function expectPortfolioSelectShows(page: Page, name: string): Promise<void> {
  await expect(activePortfolioSelect(page)).toContainText(name);
}

export { E2E_PORTFOLIO_PRINCIPAL, E2E_PORTFOLIO_SECONDARY };
