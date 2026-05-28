import { expect, test } from '@playwright/test';

import { analysisConfigProfileTabs, gotoFiiConfigPage, saveAnalysisConfig, setSumColumnDiagramMultiplier } from '../../helpers/analisePage';
import { seedAnalysisEmpty } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-011 — Config Soma FII
 * @see ../../../casos-de-uso/ui/analise/fiis/11-config-soma-fii.md
 */
test.describe('UI-ANL-011', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisEmpty(request);
  });

  test('altera multiplicador do diagrama na config FII', async ({ page }) => {
    await gotoFiiConfigPage(page);
    const profileTabs = analysisConfigProfileTabs(page);
    await expect(profileTabs.getByRole('tab', { name: 'FIIs', exact: true })).toHaveAttribute(
      'aria-selected',
      'true'
    );
    await expect(page.getByText(/Vacância \+ Qtd Ativos \+ Alavancagem \+ Segmento/)).toBeVisible();
    await expect(page.getByText(/Lucros \+ Dívida/)).toHaveCount(0);
    await setSumColumnDiagramMultiplier(page, '3.5');
    await saveAnalysisConfig(page);
    await expect(page.getByLabel('Multiplicador do diagrama')).toHaveValue('3.5');
  });
});
