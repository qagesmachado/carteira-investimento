import { expect, test } from '../fixtures/test';

import { clearAllBudgetProfiles } from '../helpers/seedBudget';

/**
 * UI-FIN-014 — Financeiro sem perfil (onboarding)
 * @see ../../casos-de-uso/ui/financeiro/14-sem-perfil-onboarding.md
 */
test.describe('UI-FIN-014', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllBudgetProfiles(request);
  });

  test('Painel exibe cabeçalho e onboarding com CTA para criar perfil', async ({ page }) => {
    await page.goto('/financeiro', { waitUntil: 'domcontentloaded' });

    await expect(page.getByTestId('financeiro-painel-heading')).toBeVisible({ timeout: 15_000 });
    const cta = page.getByTestId('financeiro-painel-sem-perfil-cta');
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute('href', '/financeiro/perfis');
  });

  test('Despesas e Metas mantêm o cabeçalho no estado vazio', async ({ page }) => {
    await page.goto('/financeiro/despesas/2026-07', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('financeiro-despesas-heading')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('financeiro-despesas-sem-perfil-cta')).toHaveAttribute(
      'href',
      '/financeiro/perfis'
    );

    await page.goto('/financeiro/metas', { waitUntil: 'domcontentloaded' });
    await expect(page.getByTestId('financeiro-metas-heading')).toBeVisible({ timeout: 15_000 });
    await expect(page.getByTestId('financeiro-metas-sem-perfil-cta')).toBeVisible();
  });
});
