import { expect, test } from '../fixtures/test';

import {
  gotoRebalanceConfigPage,
  saveRebalanceConfig
} from '../helpers/rebalancePage';
import { seedRebalanceEmpty } from '../helpers/seedRebalance';
import { setPortfolioMethodologyAuvp } from '../helpers/seedAnalysis';

/**
 * UI-REB-014 — Modo de relação ETF/Ação
 * @see ../../../casos-de-uso/ui/rebalanceamento/14-modo-relacao-etf-acao.md
 */
test.describe('UI-REB-014', () => {
  test.beforeEach(async ({ request }) => {
    const portfolioId = await seedRebalanceEmpty(request);
    await setPortfolioMethodologyAuvp(request, portfolioId, 'stock-br');
  });

  test('alterna para conjunto único e oculta sliders ETF/Ação', async ({ page }) => {
    await gotoRebalanceConfigPage(page);
    await expect(page.getByTestId('rebalance-stocks-split-unified-note')).toBeVisible();
    await expect(page.getByTestId('stocks-split-slider-etf')).toHaveCount(0);

    page.once('dialog', (dialog) => dialog.accept());
    const bySubtypeOption = page.getByTestId('rebalance-stocks-split-mode-by_subtype');
    await bySubtypeOption.locator('input[type="checkbox"]').check({ force: true });

    await expect(page.getByTestId('stocks-split-slider-etf')).toBeVisible();
    await expect(page.getByTestId('stocks-split-slider-etf')).toHaveValue('50');
    await expect(page.getByTestId('stocks-split-slider-stock')).toHaveValue('50');

    page.once('dialog', (dialog) => dialog.accept());
    const unifiedOption = page.getByTestId('rebalance-stocks-split-mode-unified');
    await unifiedOption.locator('input[type="checkbox"]').check({ force: true });

    await expect(page.getByTestId('stocks-split-slider-etf')).toHaveCount(0);
    await expect(page.getByTestId('rebalance-stocks-split-unified-note')).toBeVisible();

    await saveRebalanceConfig(page);
    await expect(page.getByRole('alert').filter({ hasText: 'Metas salvas.' })).toBeVisible();
  });
});
