import { expect, test } from '../fixtures/test';

import { gotoAnaliseSumarioPage } from '../helpers/analisePage';
import {
  seedAnalysisWithBbse3,
  seedAnalysisWithPendingBbse3
} from '../helpers/seedAnalysis';

/**
 * UI-ANL-018 — Conferir ativos pendentes no sumário
 * @see ../../../casos-de-uso/ui/analise/18-conferir-pendentes.md
 */
test.describe('UI-ANL-018', () => {
  test('abre modal com pendentes agrupados por tipo', async ({ page, request }) => {
    await seedAnalysisWithPendingBbse3(request);
    await gotoAnaliseSumarioPage(page);

    await expect(page.getByTestId('analysis-kpi-pending')).toContainText('1');
    await expect(page.getByTestId('analysis-kpi-pending-review')).toBeVisible();

    await page.getByTestId('analysis-kpi-pending-review').click();

    await expect(page.getByTestId('analysis-pending-assets-modal')).toBeVisible();
    await expect(page.getByTestId('analysis-pending-assets-count')).toContainText('1 ativo pendente');
    await expect(page.getByTestId('analysis-pending-group-stock_br')).toContainText('Ações/ETF BR');
    await expect(page.getByTestId('analysis-pending-group-stock_br')).toContainText('BBSE3');

    await page.getByTestId('analysis-pending-assets-close').click();
    await expect(page.getByTestId('analysis-pending-assets-modal')).toHaveCount(0);
  });

  test('oculta botão Conferir quando não há pendentes', async ({ page, request }) => {
    await seedAnalysisWithBbse3(request);
    await gotoAnaliseSumarioPage(page);

    await expect(page.getByTestId('analysis-kpi-pending')).toContainText('0');
    await expect(page.getByTestId('analysis-kpi-pending-review')).toHaveCount(0);
  });
});
