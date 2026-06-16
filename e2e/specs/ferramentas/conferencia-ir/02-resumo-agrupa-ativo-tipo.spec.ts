import { expect, test } from '../../fixtures/test';

import {
  clickIrTab,
  gotoConferenciaIrPage,
  selectIrYear
} from '../../helpers/conferenciaIrPage';
import { seedConferenciaIrBase } from '../../helpers/seedConferenciaIr';

/**
 * UI-IR-002 — Resumo agrupa por ativo e tipo
 * @see ../../../../casos-de-uso/ui/ferramentas/conferencia-ir/02-resumo-agrupa-ativo-tipo.md
 */
test.describe('UI-IR-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedConferenciaIrBase(request);
  });

  test('aba Resumo mostra totais de Dividendo e JCP por ativo', async ({ page }) => {
    await gotoConferenciaIrPage(page);
    await selectIrYear(page, 2024);
    await clickIrTab(page, 'resumo');

    const table = page.getByTestId('ir-table-resumo');
    const row = table.locator('tbody tr').filter({ hasText: 'BBSE3' });
    await expect(row).toBeVisible();
    await expect(row).toContainText('R$');
    await expect(row.getByRole('cell').nth(2)).toContainText('100');
    await expect(row.getByRole('cell').nth(3)).toContainText('30');
  });
});
