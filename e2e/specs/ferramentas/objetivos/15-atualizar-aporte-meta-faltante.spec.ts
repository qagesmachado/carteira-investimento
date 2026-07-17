import { expect, test } from '../../fixtures/test';


import {
  createPensionObjectiveUi,
  gotoObjetivosPage,
  savePensionContributionUi,
  selectObjectiveCard
} from '../../helpers/objetivosPage';
import { seedObjetivosEmpty } from '../../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/ferramentas/objetivos/15-atualizar-aporte-meta-faltante.md */
test.describe('UI-OBJ-015', () => {
  test.beforeEach(async ({ request }) => {
    await seedObjetivosEmpty(request);
  });

  test('atualiza aporte e exibe faltante e progresso', async ({ page }) => {
    const year = new Date().getFullYear();
    await gotoObjetivosPage(page);
    await createPensionObjectiveUi(page, {
      name: 'Previdência IR',
      year,
      income: '120000'
    });

    await selectObjectiveCard(page, 'Previdência IR');
    await expect(page.getByTestId('pension-remaining-value')).toHaveText(/14\.400,00/);

    await savePensionContributionUi(page, '6000');
    await expect(page.getByTestId('pension-contributed-display')).toHaveText(/6\.000,00/);

    await expect(page.getByTestId('pension-remaining-value')).toHaveText(/8\.400,00/);
    const monthsRemaining = 12 - new Date().getMonth();
    await expect(page.getByTestId('pension-months-remaining')).toContainText(String(monthsRemaining));
    await expect(page.getByTestId('pension-monthly-value')).toContainText(
      (8_400 / monthsRemaining).toLocaleString('pt-BR', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    );
    await expect(page.getByTestId('pension-progress-value')).toHaveText(/41,7/);
  });
});
