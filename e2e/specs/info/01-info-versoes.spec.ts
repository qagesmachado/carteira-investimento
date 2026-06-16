import { expect, test } from '../fixtures/test';

/**
 * UI-INFO-001 — Página Info mostra estado do banco
 * @see ../../../casos-de-uso/ui/info/01-info-versoes.md
 */
test.describe('UI-INFO-001', () => {
  test('exibe versão do banco, selo de atualizado e caminho do banco', async ({ page }) => {
    await page.goto('/info');

    await expect(page.getByRole('heading', { name: 'Informações do sistema' })).toBeVisible();

    const table = page.getByTestId('info-table');
    await expect(table).toBeVisible();

    await expect(page.getByTestId('info-db-version')).toContainText('v');
    await expect(page.getByTestId('info-db-path')).not.toBeEmpty();

    // Após init_db, o banco é gravado na versão atual do schema → atualizado.
    await expect(page.getByTestId('info-db-status')).toHaveText('atualizado');
  });

  test('rodapé tem link de versão que leva para /info', async ({ page }) => {
    await page.goto('/dashboard');

    const link = page.getByTestId('footer-version-link');
    await expect(link).toBeVisible();
    await link.click();

    await expect(page).toHaveURL(/\/info$/);
    await expect(page.getByRole('heading', { name: 'Informações do sistema' })).toBeVisible();
  });
});
