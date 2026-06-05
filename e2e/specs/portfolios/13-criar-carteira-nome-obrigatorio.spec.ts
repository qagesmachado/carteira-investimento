import { expect, test } from '../fixtures/test';


import { gotoPortfoliosPage } from '../helpers/portfoliosPage';
import { seedPortfoliosEmpty } from '../helpers/seedPortfolios';

/**
 * UI-PRT-013 — Criar carteira sem nome
 * @see ../../../casos-de-uso/ui/portfolios/13-criar-carteira-nome-obrigatorio.md
 */
test.describe('UI-PRT-013', () => {
  test.beforeEach(async ({ request }) => {
    await seedPortfoliosEmpty(request);
  });

  test('não cria carteira com nome vazio', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await page.getByRole('heading', { name: 'Nova carteira' }).locator('..').getByRole('button', { name: 'Criar' }).click();
    await expect(page.getByRole('alert').filter({ hasText: 'Informe o nome da carteira.' })).toBeVisible();
    await expect(page.getByText('Nenhuma carteira ainda.')).toBeVisible();
  });
});
