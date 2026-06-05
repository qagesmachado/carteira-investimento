import { expect, test } from '../../fixtures/test';


import {
  analysisPanel,
  clickClassificarOnFiiRow,
  expectPreviewText,
  expectUnsavedChangesWarning,
  expectViabilityBadge,
  gotoFiisPage,
  saveAnalysisPanel,
  selectFundamentalScore,
  selectViabilidade
} from '../../helpers/analisePage';
import { TICKER_HGLG11 } from '../../helpers/e2eFixtures';
import { seedAnalysisWithFii } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-008 — Classificar FII viabilidade
 * @see ../../../casos-de-uso/ui/analise/fiis/08-classificar-fii-viabilidade.md
 */
test.describe('UI-ANL-008', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithFii(request);
  });

  test('classifica indicadores e viabilidade manual', async ({ page }) => {
    await gotoFiisPage(page);
    await clickClassificarOnFiiRow(page, TICKER_HGLG11);
    await expectUnsavedChangesWarning(page, false);
    await selectFundamentalScore(page, 'Vacância', '5 - Vacância até 5%.');
    await expectPreviewText(page, 'vacancia', 'Vacância até 5%.');
    await expectUnsavedChangesWarning(page);
    await selectFundamentalScore(page, 'Qtd de Ativos', '5 - 10 ativos ou mais.');
    await selectFundamentalScore(page, 'Alavancagem Financeira', '5 - Alavancagem até 15%.');
    await analysisPanel(page)
      .locator('label.form-control')
      .filter({ hasText: 'Segmento' })
      .locator('select')
      .selectOption({ label: 'Shoppings' });
    await selectViabilidade(page, '2 - VIÁVEL');
    await saveAnalysisPanel(page);
    await expectViabilityBadge(page, TICKER_HGLG11, /2 - VIÁVEL/i, 'fii');
  });
});
