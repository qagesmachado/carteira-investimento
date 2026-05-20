import { expect, test } from '@playwright/test';

import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  clickClassificarOnRow,
  expectViabilityBadge,
  gotoAcoesBrPage,
  saveAnalysisPanel,
  selectFundamentalScore,
  selectViabilidade
} from '../helpers/analisePage';
import { seedAnalysisWithBbse3 } from '../helpers/seedAnalysis';

/**
 * UI-ANL-002 — Classificar critérios fundamentais BBSE3
 * @see ../../../casos-de-uso/ui/analise/02-classificar-fundamental-bbse3.md
 */
test.describe('UI-ANL-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisWithBbse3(request);
  });

  test('classifica quatro critérios e exibe viabilidade', async ({ page }) => {
    await gotoAcoesBrPage(page);

    await clickClassificarOnRow(page, TICKER_BBSE3);
    await selectFundamentalScore(page, 'Lucros', '5 - Em 100% dos anos nos últimos 10 anos');
    await selectFundamentalScore(
      page,
      'Dívida Líq/EBITDA',
      '5 - Até 2 nos últimos 5 anos'
    );
    await selectFundamentalScore(page, 'Tag along', '5 - 100%');
    await selectFundamentalScore(page, 'Segmento', '5 - Perene');
    await selectViabilidade(page, '2 - VIÁVEL');
    await saveAnalysisPanel(page);

    await expect(page.getByRole('alert').filter({ hasText: 'Classificação salva.' })).toBeVisible();
    await expectViabilityBadge(page, TICKER_BBSE3, /VIÁVEL/);
  });
});
