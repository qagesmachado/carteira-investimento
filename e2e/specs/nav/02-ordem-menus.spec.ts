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

  test('Carteira contém itens de investimento e ferramentas migradas', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Carteira');

    const header = page.locator('header');
    await expect(header.getByRole('link', { name: 'Carteiras' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Rebalanceamento' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Análise de ativos' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Proventos' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Gerenciamento de objetivos' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Taxas cripto' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Conferência anual de IR' })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Controle de patrimônio' })).toBeVisible();
  });

  test('Banco de dados contém Ativos e Dados', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Banco de dados');

    const header = page.locator('header');
    await expect(header.getByRole('link', { name: 'Ativos', exact: true })).toBeVisible();
    await expect(header.getByRole('link', { name: 'Dados', exact: true })).toBeVisible();
  });

  test('Carteira abre Gerenciamento de objetivos em /objetivos', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Carteira');
    await page.locator('header').getByRole('link', { name: 'Gerenciamento de objetivos' }).click();
    await expect(page).toHaveURL(/\/objetivos$/);
    await expect(page.getByRole('heading', { name: 'Objetivos financeiros' })).toBeVisible();
  });

  test('Carteira abre Taxas cripto em /taxas-cripto', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Carteira');
    await page.locator('header').getByRole('link', { name: 'Taxas cripto' }).click();
    await expect(page).toHaveURL(/\/taxas-cripto$/);
    await expect(page.getByRole('heading', { name: 'Criptomoedas', level: 1 })).toBeVisible();
  });

  test('Ferramentas abre Cálculo de preço médio', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Ferramentas');
    await page.locator('header').getByRole('link', { name: 'Cálculo de preço médio' }).click();
    await expect(page).toHaveURL(/\/calculo-preco-medio$/);
    await expect(page.getByRole('heading', { name: 'Cálculo de preço médio' })).toBeVisible();
  });

  test('Financeiro abre Financiamento imóvel', async ({ page }) => {
    await gotoDashboardPage(page);
    await openNavMenu(page, 'Financeiro');
    await page.locator('header').getByRole('link', { name: 'Financiamento imóvel' }).click();
    await expect(page).toHaveURL(/\/financeiro\/financiamento-imovel$/);
    await expect(page.getByRole('heading', { name: 'Financeiro', level: 1 })).toBeVisible();
  });
});
