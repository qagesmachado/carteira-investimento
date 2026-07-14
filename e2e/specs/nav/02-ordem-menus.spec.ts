import { expect, test } from '../fixtures/test';


import { gotoDashboardPage } from '../helpers/dashboardPage';
import { expectTopLevelMenuOrder, openNavMenu } from '../helpers/navPage';

/**
 * UI-NAV-002 — Ordem e hierarquia dos menus
 * @see ../../../casos-de-uso/ui/nav/02-ordem-menus.md
 */
test.describe('UI-NAV-002', () => {
  test('menus na ordem Dashboard → Visão consolidada → Carteira → Banco de dados → Ferramentas → Financeiro', async ({
    page
  }) => {
    await gotoDashboardPage(page);
    await expectTopLevelMenuOrder(page);
  });

  test('Carteira contém Carteiras, Rebalanceamento, Análise e Proventos', async ({
    page
  }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Carteira');

    const header = page.locator('header');
    await expect(header.getByRole('link', { name: 'Carteiras' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Rebalanceamento' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Análise de ativos' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Proventos' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Gerenciamento de objetivos' })).toHaveCount(0);
    await expect(header.getByRole('link', { name: 'Taxas cripto' })).toHaveCount(0);
  });

  test('Banco de dados contém Ativos e Dados', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Banco de dados');

    const header = page.locator('header');
    await expect(header.getByRole('link', { name: 'Ativos', exact: true })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Dados', exact: true })).toBeVisible();
  });

  test('Ferramentas abre Gerenciamento de objetivos em /ferramentas/objetivos', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Ferramentas');
    await page.locator('header').getByRole('link', { name: 'Gerenciamento de objetivos' }).click();
    await expect(page).toHaveURL(/\/ferramentas\/objetivos$/);
    await expect(page.getByRole('heading', { name: 'Objetivos financeiros' })).toBeVisible();
  });

  test('Ferramentas abre Taxas cripto em /ferramentas/criptomoedas', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Ferramentas');
    await page.locator('header').getByRole('link', { name: 'Taxas cripto' }).click();
    await expect(page).toHaveURL(/\/ferramentas\/criptomoedas$/);
    await expect(page.getByRole('heading', { name: 'Criptomoedas', level: 1 })).toBeVisible();
  });
});
