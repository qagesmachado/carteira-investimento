import { expect, test } from '../../fixtures/test';


import { createObjectiveUi, gotoObjetivosPage } from '../../helpers/objetivosPage';
import { seedObjetivosWithStock } from '../../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/ferramentas/objetivos/02-criar-objetivo.md */
test.describe('UI-OBJ-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedObjetivosWithStock(request);
  });

  test('cria objetivo Reserva Emergência', async ({ page }) => {
    await gotoObjetivosPage(page);
    await createObjectiveUi(page, 'Reserva Emergência');
    await expect(page.getByRole('button', { name: /Reserva Emergência/ })).toBeVisible();
  });
});
