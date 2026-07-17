import { expect, test } from '../fixtures/test';

import {
  gotoAcoesBrPage,
  openSumColumnConfigModal,
  saveAnalysisConfig,
  setAnalysisMethodologyComponents,
  setSumColumnDiagramMultiplier
} from '../helpers/analisePage';
import { seedAnalysisWithBbse3 } from '../helpers/seedAnalysis';

/**
 * UI-ANL-004 — Configuração da coluna Soma
 * @see ../../../casos-de-uso/ui/analise/04-config-altera-viabilidade.md
 */
test.describe('UI-ANL-004', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithBbse3(request);
  });

  test('salva alteração do multiplicador e exibe colunas Fundamental, Diagrama e Soma', async ({ page }) => {
    await gotoAcoesBrPage(page);
    await expect(page.getByRole('columnheader', { name: 'Fundamental' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Diagrama' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Soma' })).toBeVisible();

    await openSumColumnConfigModal(page);
    await expect(page.getByRole('heading', { name: 'Configurar metodologia de análise' })).toBeVisible();
    await setSumColumnDiagramMultiplier(page, '3');
    await saveAnalysisConfig(page);
    await expect(page.getByTestId('analysis-sum-config-modal')).toHaveCount(0);
    await expect(page.getByRole('columnheader', { name: 'Soma' })).toBeVisible();
  });

  test('oculta coluna Fundamental quando desmarcada e persiste na tabela', async ({ page }) => {
    await gotoAcoesBrPage(page);
    await openSumColumnConfigModal(page);
    await setAnalysisMethodologyComponents(page, { fundamental: false, diagram: true });
    await saveAnalysisConfig(page);

    await expect(page.getByRole('columnheader', { name: 'Fundamental' })).toHaveCount(0);
    await expect(page.getByRole('columnheader', { name: 'Diagrama' })).toBeVisible();
    await expect(page.getByRole('columnheader', { name: 'Soma' })).toBeVisible();
  });
});
