import { expect, test } from '@playwright/test';

import { gotoFiisPage } from '../../helpers/analisePage';
import { seedAnalysisEmpty } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-007 — Carregamento análise FIIs
 * @see ../../../casos-de-uso/ui/analise/fiis/07-carregamento-fiis.md
 */
test.describe('UI-ANL-007', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisEmpty(request);
  });

  test('carrega página sem erro com estado vazio', async ({ page }) => {
    await gotoFiisPage(page);
    await expect(page.getByRole('heading', { name: 'Fundos imobiliários (FIIs)' })).toBeVisible();
    await expect(page.getByText(/Crie ou selecione uma carteira/i)).toBeVisible();
  });
});
