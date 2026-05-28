import { expect, test } from '@playwright/test';

import {
  analysisPanel,
  clickClassificarOnFiiRow,
  gotoFiisPage,
  gotoFiiSegmentosPage
} from '../../helpers/analisePage';
import { TICKER_HGLG11 } from '../../helpers/e2eFixtures';
import { seedAnalysisWithFii } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-012 — CRUD segmento FII
 * @see ../../../casos-de-uso/ui/analise/fiis/12-crud-segmento.md
 */
test.describe('UI-ANL-012', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithFii(request);
  });

  test('adiciona segmento e reflete no modal de classificação', async ({ page }) => {
    await gotoFiiSegmentosPage(page);
    await page.getByRole('button', { name: 'Adicionar' }).click();
    await page.getByLabel('Nome').last().fill('Logística Premium');
    await page.getByLabel('Texto explicativo').last().fill('Segmento premium de logística.');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await gotoFiisPage(page);
    await clickClassificarOnFiiRow(page, TICKER_HGLG11);
    await expect(
      analysisPanel(page)
        .locator('label.form-control')
        .filter({ hasText: 'Segmento' })
        .locator('select')
    ).toContainText('Logística Premium');
  });
});
