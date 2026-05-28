import { expect, test } from '@playwright/test';

import {
  acceptDialogs,
  clickRemovePosition,
  gotoPortfoliosPage,
  positionsTable
} from '../helpers/portfoliosPage';
import { TICKER_KLBN } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { expectPaymentRow, gotoProventosPage } from '../helpers/proventosPage';
import { seedDadosKlbnPositionWithDividend } from '../helpers/seedDados';

/**
 * UI-DAD-008 — Remover posição mantém proventos
 * @see ../../../casos-de-uso/ui/dados/08-remover-posicao-proventos-persistem.md
 */
test.describe('UI-DAD-008', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedDadosKlbnPositionWithDividend(request);
  });

  test('proventos permanecem após remover posição KLBN4', async ({ page }) => {
    acceptDialogs(page);

    await gotoProventosPage(page);
    await expectPaymentRow(page, TICKER_KLBN, { amountPattern: /25[,.]00|25\.00/ });

    await gotoPortfoliosPage(page);
    await clickRemovePosition(page, TICKER_KLBN);
    await expect(positionsTable(page).locator('tr').filter({ hasText: TICKER_KLBN })).toHaveCount(0);

    await gotoProventosPage(page);
    await expectPaymentRow(page, TICKER_KLBN, { amountPattern: /25[,.]0|25\.0/ });
  });
});
