import { expect, test } from '../fixtures/test';

import { clearAllPortfolios } from '../helpers/testPortfolios';

/**
 * UI-PRV-020 — Proventos sem carteira (onboarding)
 * @see ../../../casos-de-uso/ui/proventos/20-sem-carteira-onboarding.md
 */
test.describe('UI-PRV-020', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllPortfolios(request);
  });

  test('Resumo exibe onboarding com CTA para criar carteira', async ({ page }) => {
    await page.goto('/proventos/resumo', { waitUntil: 'domcontentloaded' });

    const cta = page.getByTestId('proventos-resumo-sem-carteira-cta');
    await expect(cta).toBeVisible({ timeout: 15_000 });
    await expect(cta).toHaveAttribute('href', '/portfolios');
  });

  test('Lançamentos exibe onboarding e não a lista global', async ({ page }) => {
    await page.goto('/proventos/lancamentos', { waitUntil: 'domcontentloaded' });

    const cta = page.getByTestId('proventos-lancamentos-sem-carteira-cta');
    await expect(cta).toBeVisible({ timeout: 15_000 });
    await expect(cta).toHaveAttribute('href', '/portfolios');
    await expect(page.getByTestId('proventos-lista-section')).toHaveCount(0);
  });
});
