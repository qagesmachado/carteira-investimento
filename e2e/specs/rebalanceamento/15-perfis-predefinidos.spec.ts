import { expect, test } from '../fixtures/test';

import {
  applyRebalanceProfilePreset,
  gotoRebalanceConfigPage,
  saveRebalanceConfig
} from '../helpers/rebalancePage';
import { seedRebalanceEmpty } from '../helpers/seedRebalance';

/**
 * UI-REB-015 — Perfis predefinidos na configuração
 * @see ../../../casos-de-uso/ui/rebalanceamento/15-perfis-predefinidos.md
 */
test.describe('UI-REB-015', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceEmpty(request);
  });

  test('aplica perfil conservador no formulário e persiste ao salvar', async ({ page }) => {
    await gotoRebalanceConfigPage(page);
    await applyRebalanceProfilePreset(page, 'conservative');

    await expect(page.getByTestId('custom-allocation-slider-fixed_income')).toHaveValue('80');
    await expect(page.getByTestId('custom-allocation-slider-stocks')).toHaveValue('8');
    await expect(page.getByTestId('custom-allocation-slider-crypto')).toHaveValue('2');

    await saveRebalanceConfig(page);
    await expect(page.getByRole('alert').filter({ hasText: 'Metas salvas.' })).toBeVisible();
  });
});
