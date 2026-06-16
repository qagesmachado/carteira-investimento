import { expect, test } from '../fixtures/test';

/**
 * UI-INFO-002 — Página Info mostra as novidades (release notes) da versão
 * @see ../../../casos-de-uso/ui/info/02-info-novidades.md
 */
test.describe('UI-INFO-002', () => {
  test('exibe a seção de novidades com os itens da versão atual', async ({ page }) => {
    await page.goto('/info');

    await expect(page.getByRole('heading', { name: 'Informações do sistema' })).toBeVisible();

    const notes = page.getByTestId('info-release-notes');
    await expect(notes).toBeVisible();
    await expect(notes.getByRole('heading')).toContainText('Novidades da versão');

    const items = notes.locator('li');
    await expect(items.first()).toBeVisible();
    expect(await items.count()).toBeGreaterThan(0);
  });
});
