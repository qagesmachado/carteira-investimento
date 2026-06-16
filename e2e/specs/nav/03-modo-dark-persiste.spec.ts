import { expect, test } from '../fixtures/test';

import { gotoDashboardPage } from '../helpers/dashboardPage';
import { gotoObjetivosPage } from '../helpers/objetivosPage';
import {
  clickThemeToggle,
  expectDocumentTheme,
  expectThemePreferenceStored,
  themeToggle
} from '../helpers/navPage';

/**
 * UI-NAV-003 — Modo dark persiste entre páginas
 * @see ../../../casos-de-uso/ui/nav/03-modo-dark-persiste.md
 */
test.describe('UI-NAV-003', () => {
  test('toggle alterna tema, persiste em navegação e reload', async ({ page }) => {
    await gotoDashboardPage(page);
    await expectDocumentTheme(page, 'light');
    await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'false');

    await clickThemeToggle(page);
    await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expectDocumentTheme(page, 'dim');
    await expectThemePreferenceStored(page, 'dim');

    await gotoObjetivosPage(page);
    await expectDocumentTheme(page, 'dim');

    await page.reload();
    await expect(page.getByRole('heading', { name: 'Objetivos financeiros' })).toBeVisible();
    await expectDocumentTheme(page, 'dim');

    await clickThemeToggle(page);
    await expect(themeToggle(page)).toHaveAttribute('aria-pressed', 'false');
    await expectThemePreferenceStored(page, 'light');
    await expectDocumentTheme(page, 'light');
  });
});
