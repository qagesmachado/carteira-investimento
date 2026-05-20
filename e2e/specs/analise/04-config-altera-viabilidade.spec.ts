import { expect, test } from '@playwright/test';

import { gotoAnaliseConfigPage, saveAnalysisConfig, setSumColumnDiagramMultiplier } from '../helpers/analisePage';
import { seedAnalysisWithBbse3 } from '../helpers/seedAnalysis';

/**
 * UI-ANL-004 — Configuração da coluna Soma
 * @see ../../../casos-de-uso/ui/analise/04-config-altera-viabilidade.md
 */
test.describe('UI-ANL-004', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithBbse3(request);
  });

  test('salva alteração do multiplicador do diagrama', async ({ page }) => {
    await gotoAnaliseConfigPage(page);
    await setSumColumnDiagramMultiplier(page, '3');
    await saveAnalysisConfig(page);
    await expect(page.getByRole('alert').filter({ hasText: 'Configuração salva.' })).toBeVisible();
  });
});
