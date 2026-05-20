import { test } from '@playwright/test';

import {
  clickPositionDetails,
  expectPositionDetailsVisible,
  gotoConsolidadaPage
} from '../helpers/consolidadaPage';
import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-016 — Detalhes expansíveis com preços unitários
 * @see ../../../casos-de-uso/ui/consolidada/16-detalhes-posicao-precos.md
 */
test.describe('UI-CNS-016', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('abre painel com preço médio e cotação em BBSE3', async ({ page }) => {
    await gotoConsolidadaPage(page);
    await clickPositionDetails(page, TICKER_BBSE3);
    await expectPositionDetailsVisible(page, /Preço médio/);
    await expectPositionDetailsVisible(page, /cotação/i);
  });
});
