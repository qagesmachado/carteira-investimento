import { expect, test } from '../fixtures/test';


import { isApiQuoteRefreshResponse } from '../helpers/apiResponses';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  clickRefreshQuotes,
  gotoDashboardPage,
  topAssetsSection
} from '../helpers/dashboardPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-DASH-007 — Top ativos abas e tabela
 * @see ../../../casos-de-uso/ui/dashboard/07-top-ativos-abas-tabela.md
 */
test.describe('UI-DASH-007', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('exibe abas, colunas e ticker sem .SA', async ({ page }) => {
    await gotoDashboardPage(page);

    const quotesRefresh = page.waitForResponse(
      (r) => isApiQuoteRefreshResponse(r) && r.ok(),
      { timeout: 60_000 }
    );
    await clickRefreshQuotes(page);
    await quotesRefresh;

    const section = topAssetsSection(page);
    await expect(section.getByRole('tab', { name: 'Maior lucro (%)' })).toBeVisible();
    await expect(section.getByRole('tab', { name: 'Maior posição' })).toBeVisible();
    await expect(section.getByRole('tab', { name: 'Proventos (total)' })).toBeVisible();
    await expect(section.getByRole('tab', { name: 'Retorno bruto' })).toBeVisible();

    await expect(section.locator('th', { hasText: 'Ticker' })).toBeVisible();
    await expect(section.locator('th', { hasText: 'Nome do ativo' })).toBeVisible();
    await expect(section.locator('th', { hasText: 'Tipo' })).toBeVisible();
    await expect(section.locator('th', { hasText: 'Evolução 12M' })).toBeVisible();
    await expect(section.locator('th', { hasText: '#' })).toBeVisible();

    await expect(section.locator('tbody tr').filter({ hasText: TICKER_BBSE3 })).toBeVisible();
    await expect(section.locator('tbody tr').filter({ hasText: `${TICKER_BBSE3}.SA` })).toHaveCount(0);

    await expect(section.locator('tbody tr').first()).toContainText(/%/);
    await expect(section.locator('tbody tr').first()).toContainText(/\(/);
    await expect(section.getByTestId('dashboard-top-see-all')).toHaveAttribute(
      'href',
      '/portfolios/consolidada'
    );
  });
});
