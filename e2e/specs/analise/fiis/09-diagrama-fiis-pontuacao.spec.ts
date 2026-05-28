import { expect, test } from '@playwright/test';

import {
  clickClassificarOnFiiRow,
  fiiAnalysisRow,
  gotoFiisPage,
  openDiagramTab,
  saveAnalysisPanel
} from '../../helpers/analisePage';
import { TICKER_HGLG11 } from '../../helpers/e2eFixtures';
import { seedAnalysisWithFii } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-009 — Diagrama FIIs pontuação
 * @see ../../../casos-de-uso/ui/analise/fiis/09-diagrama-fiis-pontuacao.md
 */
test.describe('UI-ANL-009', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithFii(request);
  });

  test('salva diagrama e exibe pontuação na tabela', async ({ page }) => {
    await gotoFiisPage(page);
    await clickClassificarOnFiiRow(page, TICKER_HGLG11);
    await openDiagramTab(page);
    await page.getByRole('radio', { name: /Localização — Sim/i }).check();
    await page.getByRole('radio', { name: /Propriedades — Sim/i }).check();
    await saveAnalysisPanel(page);
    await expect(fiiAnalysisRow(page, TICKER_HGLG11)).toContainText('+2');
  });
});
