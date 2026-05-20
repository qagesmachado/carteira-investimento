import { test } from '@playwright/test';

import { E2E_CDB_IDENTIFIER } from '../helpers/e2eFixtures';
import { expectNoClassificarInRow } from '../helpers/analisePage';
import { gotoPortfoliosPage } from '../helpers/portfoliosPage';
import { seedPortfoliosWithRfPosition } from '../helpers/seedPortfolios';

/**
 * UI-ANL-006 — Sem botão Classificar para RF/FII
 * @see ../../../casos-de-uso/ui/analise/06-sem-botao-rf-fii.md
 */
test.describe('UI-ANL-006', () => {
  test.beforeEach(async ({ request }) => {
    await seedPortfoliosWithRfPosition(request);
  });

  test('linha de RF manual não exibe Classificar', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await expectNoClassificarInRow(page, E2E_CDB_IDENTIFIER);
  });
});
