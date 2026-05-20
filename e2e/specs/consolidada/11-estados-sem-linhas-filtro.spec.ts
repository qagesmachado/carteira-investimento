import { expect, test } from '@playwright/test';

import {
  expectSummaryCardsHidden,
  filterByText,
  gotoConsolidadaPage,
  positionsTable
} from '../helpers/consolidadaPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-011 — Filtro sem resultados na consolidada
 * @see ../../../casos-de-uso/ui/consolidada/11-estados-sem-linhas-filtro.md
 */
test.describe('UI-CNS-011', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('oculta cartões quando filtro não retorna linhas', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await filterByText(page, 'ZZZNOMATCH');
    await expect(positionsTable(page).getByText('Nenhuma posição com os filtros atuais.')).toBeVisible();
    await expectSummaryCardsHidden(page);
  });
});
