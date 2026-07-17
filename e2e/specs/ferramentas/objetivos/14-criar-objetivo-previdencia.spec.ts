import { expect, test } from '../../fixtures/test';


import {
  createPensionObjectiveUi,
  gotoObjetivosPage
} from '../../helpers/objetivosPage';
import { seedObjetivosEmpty } from '../../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/ferramentas/objetivos/14-criar-objetivo-previdencia.md */
test.describe('UI-OBJ-014', () => {
  test.beforeEach(async ({ request }) => {
    await seedObjetivosEmpty(request);
  });

  test('cria objetivo previdência com badge e meta 12%', async ({ page }) => {
    const year = new Date().getFullYear();
    await gotoObjetivosPage(page);
    await createPensionObjectiveUi(page, {
      name: 'Previdência IR',
      year,
      income: '120000'
    });

    await expect(page.getByRole('button', { name: /Previdência IR/ })).toBeVisible();
    await expect(page.getByRole('button', { name: /Previdência IR/ }).getByText('Previdência')).toBeVisible();
    await expect(page.getByTestId('pension-target-value')).toHaveText(/14\.400,00/);
    await expect(page.getByTestId('pension-contributed-display')).toHaveText(/0,00/);
    await expect(page.getByTestId('pension-edit-btn')).toBeVisible();

    await page.getByRole('button', { name: 'Renomear' }).click();
    await expect(page.getByTestId('objetivo-mode-multi')).not.toBeVisible();
    await page.getByTestId('objetivo-name-input').fill('Previdência');
    await page.getByRole('button', { name: 'Salvar' }).click();
    await expect(page.getByRole('button', { name: /Previdência/ })).toBeVisible();
  });
});
