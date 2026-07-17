import { expect, test } from '../../fixtures/test';

import {
  analysisSumConfigModal,
  gotoFiisPage,
  openSumColumnConfigModal,
  saveAnalysisConfig,
  setSumColumnDiagramMultiplier
} from '../../helpers/analisePage';
import { seedAnalysisEmpty } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-011 — Config Soma FII
 * @see ../../../casos-de-uso/ui/analise/fiis/11-config-soma-fii.md
 */
test.describe('UI-ANL-011', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisEmpty(request);
  });

  test('altera multiplicador do diagrama na tela de FIIs', async ({ page }) => {
    await gotoFiisPage(page);
    await openSumColumnConfigModal(page);
    await expect(analysisSumConfigModal(page)).toContainText(
      /Vacância \+ Qtd Ativos \+ Alavancagem \+ Segmento/
    );
    await expect(analysisSumConfigModal(page)).not.toContainText(/Lucros \+ Dívida/);
    await setSumColumnDiagramMultiplier(page, '3.5');
    await saveAnalysisConfig(page);
    await expect(analysisSumConfigModal(page).getByLabel('Multiplicador do diagrama')).toHaveValue(
      '3.5'
    );
  });
});
