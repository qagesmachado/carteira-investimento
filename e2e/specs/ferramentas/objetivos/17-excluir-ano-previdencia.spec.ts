import { expect, test } from '../../fixtures/test';


import {
  addPensionYearUi,
  createPensionObjectiveUi,
  deletePensionYearUi,
  gotoObjetivosPage,
  selectPensionYearTab
} from '../../helpers/objetivosPage';
import { seedObjetivosEmpty } from '../../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/objetivos/17-excluir-ano-previdencia.md */
test.describe('UI-OBJ-017', () => {
  test.beforeEach(async ({ request }) => {
    await seedObjetivosEmpty(request);
  });

  test('exclui ano selecionado mantendo objetivo previdência', async ({ page }) => {
    const currentYear = new Date().getFullYear();
    const extraYear = currentYear + 1;

    await gotoObjetivosPage(page);
    await createPensionObjectiveUi(page, {
      name: 'Previdência',
      year: currentYear,
      income: '120000'
    });
    await addPensionYearUi(page, { year: extraYear, income: '100000' });

    await selectPensionYearTab(page, extraYear);
    await expect(page.getByTestId(`pension-consolidated-row-${extraYear}`)).toBeVisible();

    page.once('dialog', (dialog) => dialog.accept());
    await deletePensionYearUi(page);

    await expect(page.getByTestId(`pension-consolidated-row-${extraYear}`)).toHaveCount(0);
    await expect(page.getByTestId(`pension-year-tab-${extraYear}`)).toHaveCount(0);
    await expect(page.getByTestId(`pension-year-tab-${currentYear}`)).toBeVisible();
    await expect(page.getByTestId('pension-delete-year-btn')).toHaveCount(0);
  });
});
