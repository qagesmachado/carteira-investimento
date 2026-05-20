import { expect, test } from '@playwright/test';

import {
  expectDashboardCardsVisible,
  gotoDashboardPage
} from '../helpers/dashboardPage';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-DASH-002 — Cards com carteira seed
 * @see ../../../casos-de-uso/ui/dashboard/02-cards-com-carteira-seed.md
 */
test.describe('UI-DASH-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedConsolidadaPrincipal(request);
  });

  test('exibe patrimônio e alocação na carteira ativa', async ({ page }) => {
    await gotoDashboardPage(page);

    await expectDashboardCardsVisible(page);
    await expect(page.getByText('Posições ativas')).toBeVisible();
    await expect(page.getByRole('tab', { name: 'Maior lucro (%)' })).toBeVisible();
    await page.getByRole('tab', { name: 'Proventos (total)' }).click();
    await expect(page.getByRole('tab', { name: 'Proventos (total)' })).toHaveAttribute(
      'aria-selected',
      'true'
    );
  });
});
