import { expect, test } from '@playwright/test';

import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  answerDiagramQuestion,
  clickClassificarOnRow,
  gotoAcoesBrPage,
  openDiagramTab,
  saveAnalysisPanel
} from '../helpers/analisePage';
import { seedAnalysisWithBbse3 } from '../helpers/seedAnalysis';

/**
 * UI-ANL-003 — Diagrama ações pontuação
 * @see ../../../casos-de-uso/ui/analise/03-diagrama-acoes-pontuacao.md
 */
test.describe('UI-ANL-003', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithBbse3(request);
  });

  test('preenche diagrama e exibe pontuação na tabela', async ({ page }) => {
    await gotoAcoesBrPage(page);

    await clickClassificarOnRow(page, TICKER_BBSE3);
    await openDiagramTab(page);
    await answerDiagramQuestion(page, 'ROE', 'sim');
    await saveAnalysisPanel(page);

    await expect(page.getByRole('alert').filter({ hasText: 'Classificação salva.' })).toBeVisible();
    const row = page.locator('table tbody tr').filter({ hasText: TICKER_BBSE3 });
    await expect(row.locator('td').nth(8)).toHaveText('+1');
  });
});
