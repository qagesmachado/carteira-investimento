import { expect, test } from '../fixtures/test';


import { expectDashboardCardsVisible, gotoDashboardPage } from '../helpers/dashboardPage';
import { gotoObjetivosPage } from '../helpers/objetivosPage';
import {
  clickHideMoneyToggle,
  expectHideMoneyPreferenceStored,
  expectMoneyValuesHidden,
  expectMoneyValuesVisible,
  hideMoneyToggle
} from '../helpers/navPage';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-NAV-001 — Ocultar valores persiste entre páginas
 * @see ../../../casos-de-uso/ui/nav/01-ocultar-valores-persiste.md
 */
test.describe('UI-NAV-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedConsolidadaPrincipal(request);
  });

  test('toggle oculta valores, persiste em navegação e reload', async ({ page }) => {
    await gotoDashboardPage(page);
    await expectDashboardCardsVisible(page);
    await expectMoneyValuesVisible(page);
    await expect(hideMoneyToggle(page)).toHaveAttribute('aria-pressed', 'false');

    await clickHideMoneyToggle(page);
    await expect(hideMoneyToggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expectMoneyValuesHidden(page);
    await expectHideMoneyPreferenceStored(page, true);

    await gotoObjetivosPage(page);
    await expectMoneyValuesHidden(page);

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Objetivos financeiros' })).toBeVisible();
    await expectMoneyValuesHidden(page);

    await clickHideMoneyToggle(page);
    await expect(hideMoneyToggle(page)).toHaveAttribute('aria-pressed', 'false');
    await expectHideMoneyPreferenceStored(page, false);
    await expectMoneyValuesVisible(page);
  });
});
