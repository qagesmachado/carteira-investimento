import { expect, test } from '../fixtures/test';


import {
  expectEmptyPortfolioMessage,
  expectSummaryCardsHidden,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { seedConsolidadaEmpty } from '../helpers/seedConsolidada';

/**
 * UI-CNS-001 — Carregamento sem carteira
 * @see ../../../casos-de-uso/ui/consolidada/01-carregamento-sem-carteira.md
 */
test.describe('UI-CNS-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedConsolidadaEmpty(request);
  });

  test('exibe orientação quando não há carteira', async ({ page }) => {
    await gotoConsolidadaPage(page);

    await expect(page.getByRole('heading', { name: 'Visão consolidada' })).toBeVisible();
    await expectEmptyPortfolioMessage(page);
    await expectSummaryCardsHidden(page);
  });
});
