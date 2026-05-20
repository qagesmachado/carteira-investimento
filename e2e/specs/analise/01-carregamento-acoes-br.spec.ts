import { expect, test } from '@playwright/test';

import { expectEmptyAnalysisState, gotoAcoesBrPage } from '../helpers/analisePage';
import { seedAnalysisEmpty } from '../helpers/seedAnalysis';

/**
 * UI-ANL-001 — Carregamento análise ações BR
 * @see ../../../casos-de-uso/ui/analise/01-carregamento-acoes-br.md
 */
test.describe('UI-ANL-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisEmpty(request);
  });

  test('carrega página sem erro com estado vazio', async ({ page }) => {
    await gotoAcoesBrPage(page);
    await expect(page.getByRole('heading', { name: 'Ações e ETFs (Brasil)' })).toBeVisible();
    await expectEmptyAnalysisState(page);
  });
});
