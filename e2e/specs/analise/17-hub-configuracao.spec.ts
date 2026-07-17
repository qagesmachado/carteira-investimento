import { expect, test } from '../fixtures/test';

import {
  analysisSectionTabs,
  analysisTableSection,
  gotoAnaliseHub
} from '../helpers/analisePage';
import { openNavMenu } from '../helpers/navPage';
import { seedAnalysisWithBbse3 } from '../helpers/seedAnalysis';

/**
 * UI-ANL-017 — Hub sumário da análise
 * @see ../../../casos-de-uso/ui/analise/17-hub-configuracao.md
 */
test.describe('UI-ANL-017', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithBbse3(request);
  });

  test('menu abre sumário e navega para ações', async ({ page }) => {
    await page.goto('/dashboard');
    await openNavMenu(page, 'Carteira');
    await page.locator('header').getByRole('link', { name: 'Análise de ativos' }).click();

    await expect(page).toHaveURL(/\/analise\/sumario$/);
    await expect(page.getByRole('heading', { name: 'Análise de ativos', exact: true })).toBeVisible();
    await expect(page.getByTestId('analysis-hub-nav-cards')).toBeVisible();
    await expect(page.getByTestId('analysis-summary-kpi-cards')).toBeVisible();
    await expect(page.getByTestId('analysis-portfolio-bar')).toBeVisible();
    await expect(page.getByTestId('analysis-sum-config-section')).toHaveCount(0);
    await expect(page.getByTestId('analysis-section-tab-sumario')).toHaveClass(/bg-primary/);

    await page.getByTestId('analysis-hub-nav-acoes').click();
    await expect(page).toHaveURL(/\/analise\/acoes-br$/);
    await expect(analysisTableSection(page)).toBeVisible();
  });

  test('redirect /analise aponta para sumário', async ({ page }) => {
    await gotoAnaliseHub(page);
    await expect(page).toHaveURL(/\/analise\/sumario$/);
    await expect(analysisSectionTabs(page)).toBeVisible();
  });

  test('redirect legado /analise/configuracao aponta para sumário', async ({ page }) => {
    await page.goto('/analise/configuracao');
    await expect(page).toHaveURL(/\/analise\/sumario$/);
  });
});
