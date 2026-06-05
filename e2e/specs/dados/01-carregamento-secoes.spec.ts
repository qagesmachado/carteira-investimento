import { expect, test } from '../fixtures/test';


import { expectDadosSectionsVisible, gotoDadosPage } from '../helpers/dataPage';

/**
 * UI-DAD-001 — Carregamento da página Dados com seções
 * @see ../../../casos-de-uso/ui/dados/01-carregamento-secoes.md
 */
test.describe('UI-DAD-001', () => {
  test('exibe seções Backup, Carteira, Ativos e Proventos', async ({ page }) => {
    await gotoDadosPage(page);
    await expectDadosSectionsVisible(page);
    await expect(page.locator('.alert-error')).toHaveCount(0);
  });
});
