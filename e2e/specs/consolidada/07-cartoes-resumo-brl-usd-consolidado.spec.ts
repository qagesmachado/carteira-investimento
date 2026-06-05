import { expect, test } from '../fixtures/test';


import { expectSummaryCardsVisible, gotoConsolidadaPage } from '../helpers/consolidadaPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-007 — Cartões de resumo BRL, USD e consolidado
 * @see ../../../casos-de-uso/ui/consolidada/07-cartoes-resumo-brl-usd-consolidado.md
 */
test.describe('UI-CNS-007', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('exibe cartões de resumo com BRL e USD', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await expectSummaryCardsVisible(page);
    await expect(page.getByText('Consolidado total (em reais)')).toBeVisible();
    await expect(page.getByText(/internacional USD/)).toBeVisible();
  });
});
