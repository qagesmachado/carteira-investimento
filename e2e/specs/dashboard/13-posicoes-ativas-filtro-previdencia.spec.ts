import { expect, test } from '../fixtures/test';

import {
  dashboardKpiPositions,
  gotoDashboardPage,
  toggleDashboardPensionFilter
} from '../helpers/dashboardPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaWithPension } from '../helpers/seedConsolidada';

/** @see ../../../casos-de-uso/ui/dashboard/13-posicoes-ativas-filtro-previdencia.md */
test.describe('UI-DASH-013', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaWithPension(request);
  });

  test('posições ativas excluem previdência quando filtro desmarcado', async ({ page }) => {
    await gotoDashboardPage(page);

    await expect(
      page.getByTestId('dashboard-kpi-patrimony').getByTestId('dashboard-filter-pension')
    ).not.toBeChecked();
    await expect(dashboardKpiPositions(page)).toContainText('4');

    await toggleDashboardPensionFilter(page, true);
    await expect(dashboardKpiPositions(page)).toContainText('5');

    await toggleDashboardPensionFilter(page, false);
    await expect(dashboardKpiPositions(page)).toContainText('4');
  });
});
