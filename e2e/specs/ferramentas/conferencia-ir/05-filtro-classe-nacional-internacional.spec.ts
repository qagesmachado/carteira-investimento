import { expect, test } from '../../fixtures/test';

import {
  clickIrTab,
  expectTableHasTicker,
  expectTableMissingTicker,
  filterIrMarket,
  gotoConferenciaIrPage,
  selectIrYear
} from '../../helpers/conferenciaIrPage';
import { seedConferenciaIrWithInternational } from '../../helpers/seedConferenciaIr';

/**
 * UI-IR-005 — Filtro e coluna Classe (nacional/internacional)
 * @see ../../../../casos-de-uso/ui/ferramentas/conferencia-ir/05-filtro-classe-nacional-internacional.md
 */
test.describe('UI-IR-005', () => {
  test.beforeEach(async ({ request }) => {
    await seedConferenciaIrWithInternational(request);
  });

  test('filtra por classe Internacional nas três abas e ordena por Classe', async ({ page }) => {
    await gotoConferenciaIrPage(page);
    await selectIrYear(page, 2024);

    await clickIrTab(page, 'detalhado');
    const detalhado = page.getByTestId('ir-table-detalhado');
    await expect(detalhado.getByRole('columnheader', { name: /Classe/ })).toBeVisible();
    await expectTableHasTicker(page, 'ir-table-detalhado', 'BBSE3');
    await expectTableHasTicker(page, 'ir-table-detalhado', 'VOO');
    await expect(detalhado.getByRole('cell', { name: 'Nacional' }).first()).toBeVisible();
    await expect(detalhado.getByRole('cell', { name: 'Internacional' }).first()).toBeVisible();

    await detalhado.getByRole('button', { name: /Classe/ }).click();
    await filterIrMarket(page, 'international');
    await expectTableHasTicker(page, 'ir-table-detalhado', 'VOO');
    await expectTableMissingTicker(page, 'ir-table-detalhado', 'BBSE3');

    await clickIrTab(page, 'resumo');
    await expect(page.getByTestId('ir-table-resumo').getByRole('columnheader', { name: /Classe/ })).toBeVisible();
    await filterIrMarket(page, 'international');
    await expectTableHasTicker(page, 'ir-table-resumo', 'VOO');
    await expectTableMissingTicker(page, 'ir-table-resumo', 'BBSE3');

    await clickIrTab(page, 'posicoes');
    await expect(page.getByTestId('ir-table-posicoes').getByRole('columnheader', { name: /Classe/ })).toBeVisible();
    await filterIrMarket(page, 'international');
    await expectTableHasTicker(page, 'ir-table-posicoes', 'VOO');
    await expectTableMissingTicker(page, 'ir-table-posicoes', 'BBSE3');
  });
});
