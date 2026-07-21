import { expect, test } from '../fixtures/test';


import { seedProventosEmpty } from '../helpers/seedProventos';

/**
 * UI-PRV-018 — Navegação por abas (Resumo / Adicionar / Lançamentos)
 * @see ../../../casos-de-uso/ui/proventos/18-navegacao-abas.md
 */
test.describe('UI-PRV-018', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosEmpty(request);
  });

  test('menu abre em Resumo e navega entre as abas', async ({ page }) => {
    await page.goto('/proventos');
    await expect(page).toHaveURL(/\/proventos\/resumo$/);
    await expect(page.getByRole('heading', { name: 'Proventos', level: 1 })).toBeVisible();
    await expect(page.getByTestId('proventos-kpi-cards')).toBeVisible();

    await page.getByTestId('proventos-section-tab-adicionar').click();
    await expect(page).toHaveURL(/\/proventos\/adicionar$/);
    await expect(page.getByRole('heading', { name: 'Novo provento' })).toBeVisible();

    await page.getByTestId('proventos-section-tab-lancamentos').click();
    await expect(page).toHaveURL(/\/proventos\/lancamentos$/);
    await expect(page.getByRole('heading', { name: 'Proventos cadastrados' })).toBeVisible();

    await page.getByTestId('proventos-section-tab-resumo').click();
    await expect(page).toHaveURL(/\/proventos\/resumo$/);
    await expect(page.getByTestId('proventos-kpi-cards')).toBeVisible();
  });
});
