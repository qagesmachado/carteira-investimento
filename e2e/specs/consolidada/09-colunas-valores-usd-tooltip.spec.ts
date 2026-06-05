import { expect, test } from '../fixtures/test';


import { gotoConsolidadaPage, expectRowVisible } from '../helpers/consolidadaPage';
import { TICKER_VOO } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-009 — Colunas com valores USD e tooltip BRL
 * @see ../../../casos-de-uso/ui/consolidada/09-colunas-valores-usd-tooltip.md
 */
test.describe('UI-CNS-009', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('linha VOO exibe hint de equivalente em reais', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await expectRowVisible(page, TICKER_VOO);
    const row = page.locator('table tbody tr').filter({ hasText: TICKER_VOO });
    await expect(row.getByRole('button', { name: /Equivalente em reais/i })).toBeVisible();
  });
});
