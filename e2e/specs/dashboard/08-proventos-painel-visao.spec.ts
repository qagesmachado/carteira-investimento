import { expect, test } from '../fixtures/test';


import {
  dividendSummarySection,
  gotoDashboardPage,
  selectDividendYear,
  switchDividendTimeline,
  switchDividendView
} from '../helpers/dashboardPage';
import { seedDashboardDividendSummary } from '../helpers/seedDashboard';

/**
 * UI-DASH-008 — Proventos painel por ano e por mês
 * @see ../../../casos-de-uso/ui/dashboard/08-proventos-painel-visao.md
 */
test.describe('UI-DASH-008', () => {
  test.beforeEach(async ({ request }) => {
    await seedDashboardDividendSummary(request);
  });

  test('exibe proventos por ano e por mes do ano selecionado', async ({ page }) => {
    await gotoDashboardPage(page);

    const section = dividendSummarySection(page);
    await expect(section.getByRole('heading', { name: /Proventos por ano/i })).toBeVisible();
    await expect(section.getByRole('cell', { name: '2020' })).toBeVisible();
    await expect(section.getByRole('cell', { name: '2021' })).toBeVisible();

    await switchDividendView(page, 'Barras');
    await expect(section.locator('.rounded-full.bg-base-200 .h-full').first()).toBeVisible();

    await switchDividendView(page, 'Tabela');
    await switchDividendTimeline(page, 'Mensal');
    await selectDividendYear(page, 2021);
    await expect(section.getByRole('heading', { name: /Proventos mensais — 2021/i })).toBeVisible();
    await expect(section.getByRole('columnheader', { name: 'Mês' })).toBeVisible();
    await expect(section.getByRole('cell', { name: 'Fev' })).toBeVisible();
    await expect(section.getByRole('cell', { name: 'Ago' })).toBeVisible();

    await selectDividendYear(page, 2020);
    await expect(section.getByRole('heading', { name: /Proventos mensais — 2020/i })).toBeVisible();
    await expect(section.getByRole('cell', { name: 'Jun' })).toBeVisible();

    await switchDividendTimeline(page, 'Anual');
    await expect(section.getByRole('heading', { name: /Proventos por ano/i })).toBeVisible();
  });
});
