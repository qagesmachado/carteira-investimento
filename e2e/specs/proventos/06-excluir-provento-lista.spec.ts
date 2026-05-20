import { expect, test } from '@playwright/test';

import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  acceptDialogs,
  clickDeleteOnRow,
  gotoProventosPage,
  paymentsListSection,
  paymentsTable
} from '../helpers/proventosPage';
import { seedProventosWithOnePayment } from '../helpers/seedProventos';

/**
 * UI-PRV-006 — Excluir provento na lista
 * @see ../../../casos-de-uso/ui/proventos/06-excluir-provento-lista.md
 */
test.describe('UI-PRV-006', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosWithOnePayment(request);
  });

  test('remove lançamento após confirmar', async ({ page }) => {
    acceptDialogs(page);
    await gotoProventosPage(page);

    await expect(paymentsTable(page).locator('tr').filter({ hasText: TICKER_BBSE3 })).toHaveCount(1);
    await clickDeleteOnRow(page, TICKER_BBSE3);

    await expect(page.getByRole('alert').filter({ hasText: 'Provento removido.' })).toBeVisible();
    await expect(paymentsListSection(page).getByText('Nenhum provento cadastrado ainda.')).toBeVisible();
  });
});
