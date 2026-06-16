import { expect, test } from '../../fixtures/test';

import {
  clickIrTab,
  gotoConferenciaIrPage,
  selectIrYear
} from '../../helpers/conferenciaIrPage';
import { seedConferenciaIrBase } from '../../helpers/seedConferenciaIr';

/**
 * UI-IR-001 — Relatório detalhado filtra por ano
 * @see ../../../../casos-de-uso/ui/ferramentas/conferencia-ir/01-relatorio-detalhado-filtra-ano.md
 */
test.describe('UI-IR-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedConferenciaIrBase(request);
  });

  test('aba Detalhado exibe apenas proventos de 2024', async ({ page }) => {
    await gotoConferenciaIrPage(page);
    await selectIrYear(page, 2024);
    await clickIrTab(page, 'detalhado');

    const table = page.getByTestId('ir-table-detalhado');
    await expect(table.getByRole('cell', { name: '2024-03-10' })).toBeVisible();
    await expect(table.getByRole('cell', { name: '2024-09-01' })).toBeVisible();
    await expect(table.getByRole('cell', { name: '2023-06-01' })).not.toBeVisible();
  });
});
