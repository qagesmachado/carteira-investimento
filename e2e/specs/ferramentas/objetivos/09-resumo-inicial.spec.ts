import { expect, test } from '../../fixtures/test';


import { createObjectiveUi, gotoObjetivosPage, selectObjectiveCard } from '../../helpers/objetivosPage';
import { seedObjetivosWithStock } from '../../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/objetivos/09-resumo-inicial.md */
test.describe('UI-OBJ-009', () => {
  test.beforeEach(async ({ request }) => {
    await seedObjetivosWithStock(request);
  });

  test('exibe resumo com patrimônio e navega para objetivo custom', async ({ page }) => {
    await gotoObjetivosPage(page);
    await expect(page.getByTestId('objetivos-summary')).toBeVisible();
    await expect(page.getByText(/Patrimônio total/)).toBeVisible();
    await expect(page.locator('[data-testid^="summary-row-"]').filter({ hasText: 'Livre' })).toHaveCount(
      0
    );

    await createObjectiveUi(page, 'Reserva');
    await selectObjectiveCard(page, 'Reserva');
    await expect(page.getByTestId('objetivo-detail')).toContainText('Reserva');

    await selectObjectiveCard(page, 'Resumo');
    await expect(page.getByTestId('objetivos-summary')).toBeVisible();
  });
});
