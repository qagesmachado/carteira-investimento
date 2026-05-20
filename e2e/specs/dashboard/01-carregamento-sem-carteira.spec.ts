import { expect, test } from '@playwright/test';

import {
  expectEmptyDashboardMessage,
  gotoDashboardPage
} from '../helpers/dashboardPage';
import { seedConsolidadaEmpty } from '../helpers/seedConsolidada';

/**
 * UI-DASH-001 — Carregamento sem carteira
 * @see ../../../casos-de-uso/ui/dashboard/01-carregamento-sem-carteira.md
 */
test.describe('UI-DASH-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedConsolidadaEmpty(request);
  });

  test('exibe orientação quando não há carteira', async ({ page }) => {
    await gotoDashboardPage(page);

    await expect(page.getByRole('heading', { name: 'Dashboard' })).toBeVisible();
    await expectEmptyDashboardMessage(page);
  });
});
