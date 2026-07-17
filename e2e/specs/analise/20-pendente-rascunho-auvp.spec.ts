import { test } from '../fixtures/test';

import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  cancelAnalysisPanel,
  clickClassificarOnRow,
  expectAnalysisRowPendingBadge,
  expectUnsavedChangesWarning,
  gotoAcoesBrPage,
  saveAnalysisPanel,
  toggleAnalysisPendingDraft
} from '../helpers/analisePage';
import { seedAnalysisWithBbse3 } from '../helpers/seedAnalysis';

/**
 * UI-ANL-020 — Pendente como rascunho no modal AUVP
 * @see ../../../casos-de-uso/ui/analise/20-pendente-rascunho-auvp.md
 */
test.describe('UI-ANL-020', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithBbse3(request);
  });

  test('pendente só aparece na tabela após salvar; cancelar descarta', async ({ page }) => {
    await gotoAcoesBrPage(page);

    await clickClassificarOnRow(page, TICKER_BBSE3);
    await toggleAnalysisPendingDraft(page, true);
    await expectUnsavedChangesWarning(page);
    await expectAnalysisRowPendingBadge(page, TICKER_BBSE3, false);

    await cancelAnalysisPanel(page);
    await expectAnalysisRowPendingBadge(page, TICKER_BBSE3, false);

    await clickClassificarOnRow(page, TICKER_BBSE3);
    await toggleAnalysisPendingDraft(page, true);
    await saveAnalysisPanel(page, { withPending: true });

    await expectAnalysisRowPendingBadge(page, TICKER_BBSE3);
  });
});
