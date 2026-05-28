import { expect, test } from '@playwright/test';

import { gotoObjetivosPage } from '../helpers/objetivosPage';
import { expectDefaultObjectiveFreeQuantity, seedObjetivosWithStock } from '../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/objetivos/01-carregamento-livre-default.md */
test.describe('UI-OBJ-001', () => {
  test('abre em Resumo sem exibir objetivo Livre na UI', async ({ page, request }) => {
    const { portfolioId } = await seedObjetivosWithStock(request);
    await gotoObjetivosPage(page);
    await expect(page.getByTestId('objetivo-tab-resumo')).toBeVisible();
    await expect(page.getByTestId('objetivos-summary')).toBeVisible();
    await expect(page.getByRole('button', { name: /^Livre/ })).toHaveCount(0);
    await expect(page.locator('[data-testid^="summary-row-"]').filter({ hasText: 'Livre' })).toHaveCount(
      0
    );
    await expectDefaultObjectiveFreeQuantity(request, portfolioId, 'PETR4', 100);
  });
});
