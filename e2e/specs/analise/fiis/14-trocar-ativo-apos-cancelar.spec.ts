import { expect, test } from '../../fixtures/test';


import {
  analysisPanel,
  cancelAnalysisPanel,
  clickClassificarOnFiiRow,
  expectFundamentalSelectValue,
  expectResetConfirmVisible,
  expectSegmentSelectValue,
  expectUnsavedChangesWarning,
  gotoFiisPage,
  saveAnalysisPanel,
  selectFundamentalScore,
  selectViabilidade
} from '../../helpers/analisePage';
import { TICKER_BTLG11, TICKER_HGLG11 } from '../../helpers/e2eFixtures';
import { seedAnalysisWithTwoFiis } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-014 — Troca de ativo no modal sem vazar classificação anterior
 */
test.describe('UI-ANL-014', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithTwoFiis(request);
  });

  test('reabre classificação salva e não mistura dados entre FIIs', async ({ page }) => {
    await gotoFiisPage(page);

    await clickClassificarOnFiiRow(page, TICKER_HGLG11);
    await selectFundamentalScore(page, 'Vacância', '5 - Vacância até 5%.');
    await selectFundamentalScore(page, 'Qtd de Ativos', '5 - 10 ativos ou mais.');
    await selectFundamentalScore(page, 'Alavancagem Financeira', '5 - Alavancagem até 15%.');
    await analysisPanel(page)
      .locator('label.form-control')
      .filter({ hasText: 'Segmento' })
      .locator('select')
      .selectOption({ label: 'Shoppings' });
    await selectViabilidade(page, '1 - AZULIM');
    await saveAnalysisPanel(page);

    await clickClassificarOnFiiRow(page, TICKER_HGLG11);
    await expectUnsavedChangesWarning(page, false);
    await expectFundamentalSelectValue(page, 'Vacância', '5 - Vacância até 5%.');
    await expectFundamentalSelectValue(page, 'Viabilidade', '1 - AZULIM');
    await cancelAnalysisPanel(page);

    await clickClassificarOnFiiRow(page, TICKER_BTLG11);
    await expect(analysisPanel(page)).toContainText(TICKER_BTLG11);
    await expectUnsavedChangesWarning(page, false);
    await expectFundamentalSelectValue(page, 'Vacância', 'Sem classificação');
    await expectFundamentalSelectValue(page, 'Viabilidade', 'Sem classificação');

    await cancelAnalysisPanel(page);

    await clickClassificarOnFiiRow(page, TICKER_HGLG11);
    await expectFundamentalSelectValue(page, 'Vacância', '5 - Vacância até 5%.');
    await expectFundamentalSelectValue(page, 'Viabilidade', '1 - AZULIM');

    await analysisPanel(page).getByRole('button', { name: 'Resetar' }).click();
    await expectResetConfirmVisible(page);
    await analysisPanel(page).getByRole('button', { name: 'Limpar tudo' }).click();
    await expectResetConfirmVisible(page, false);
    await expectFundamentalSelectValue(page, 'Vacância', 'Sem classificação');
    await expectSegmentSelectValue(page, 'Sem segmento');
    await expectFundamentalSelectValue(page, 'Viabilidade', 'Sem classificação');
    await expectUnsavedChangesWarning(page);
    await saveAnalysisPanel(page);

    await clickClassificarOnFiiRow(page, TICKER_HGLG11);
    await expectSegmentSelectValue(page, 'Sem segmento');
    await expectFundamentalSelectValue(page, 'Viabilidade', 'Sem classificação');
    await cancelAnalysisPanel(page);
  });
});
