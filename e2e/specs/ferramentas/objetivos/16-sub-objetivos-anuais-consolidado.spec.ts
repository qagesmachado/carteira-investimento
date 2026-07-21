import { expect, test } from '../../fixtures/test';


import {
  addPensionYearUi,
  createPensionObjectiveUi,
  gotoObjetivosPage,
  savePensionContributionUi,
  selectPensionYearTab
} from '../../helpers/objetivosPage';
import { seedObjetivosEmpty } from '../../helpers/seedObjetivos';

/** @see ../../../casos-de-uso/ui/objetivos/16-sub-objetivos-anuais-consolidado.md */
test.describe('UI-OBJ-016', () => {
  test.beforeEach(async ({ request }) => {
    await seedObjetivosEmpty(request);
  });

  test('consolida aportes de múltiplos anos e alterna abas', async ({ page }) => {
    const currentYear = new Date().getFullYear();
    const previousYear = currentYear - 1;

    await gotoObjetivosPage(page);
    await createPensionObjectiveUi(page, {
      name: 'Previdência',
      year: currentYear,
      income: '120000'
    });

    await addPensionYearUi(page, { year: previousYear, income: '100000' });
    await selectPensionYearTab(page, previousYear);
    await savePensionContributionUi(page, '12000');

    await selectPensionYearTab(page, currentYear);
    await savePensionContributionUi(page, '6000');

    await expect(page.getByTestId('pension-consolidated-table')).toContainText(String(previousYear));
    await expect(page.getByTestId('pension-consolidated-table')).toContainText(String(currentYear));
    const consolidatedRows = page.locator('[data-testid^="pension-consolidated-row-"]');
    await expect(consolidatedRows.nth(0)).toHaveAttribute(
      'data-testid',
      `pension-consolidated-row-${currentYear}`
    );
    await expect(consolidatedRows.nth(1)).toHaveAttribute(
      'data-testid',
      `pension-consolidated-row-${previousYear}`
    );
    await expect(page.getByTestId(`pension-consolidated-row-${previousYear}`)).toContainText(
      /12\.000,00/
    );
    await expect(page.getByTestId(`pension-consolidated-row-${currentYear}`)).toContainText(
      /6\.000,00/
    );
    await expect(page.getByTestId('pension-contribution-detail')).toContainText(/18\.000,00/);

    await selectPensionYearTab(page, previousYear);
    await expect(page.getByTestId('pension-contributed-display')).toHaveText(/12\.000,00/);
    await expect(page.getByTestId('pension-target-value')).toHaveText(/12\.000,00/);
  });
});
