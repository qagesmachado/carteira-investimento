import { expect, test } from '@playwright/test';

import {
  clickClassificarOnFiiRow,
  expectViabilityBadge,
  fiiAnalysisRow,
  gotoFiisPage,
  openDiagramTab,
  saveAnalysisPanel
} from '../../helpers/analisePage';
import { TICKER_HGLG11 } from '../../helpers/e2eFixtures';
import { seedAnalysisWithFii } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-010 — Flag P/VP descarte
 * @see ../../../casos-de-uso/ui/analise/fiis/10-flag-pvp-descarte.md
 */
test.describe('UI-ANL-010', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithFii(request);
  });

  test('marca P/VP > 1,5 e exibe DESCARTADO com soma vazia', async ({ page }) => {
    await gotoFiisPage(page);
    await clickClassificarOnFiiRow(page, TICKER_HGLG11);
    await openDiagramTab(page);
    await page.getByRole('checkbox', { name: /P\/VP acima de 1,5/i }).check();
    await saveAnalysisPanel(page);
    await expectViabilityBadge(page, TICKER_HGLG11, 'DESCARTADO', 'fii');
    await expect(fiiAnalysisRow(page, TICKER_HGLG11).getByRole('cell').nth(9)).toHaveText('—');
  });
});
