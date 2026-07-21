import { expect, test } from '../fixtures/test';


import { gotoProventosSummaryPage } from '../helpers/proventosPage';
import { seedProventosHeldVsSold } from '../helpers/seedProventos';

/**
 * UI-PRV-019 — Destaque "Maior pagador" e "Top ativos" consideram só ativos em carteira,
 * enquanto os totais mantêm o histórico completo (mesma regra do Dashboard).
 * @see ../../../casos-de-uso/ui/proventos/19-resumo-destaque-em-carteira.md
 */
test.describe('UI-PRV-019', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosHeldVsSold(request);
  });

  test('destaque/top usam ativos em carteira; totais mantêm histórico', async ({ page }) => {
    await gotoProventosSummaryPage(page);

    // BBSE3 continua em carteira; ITSA4 foi "vendido" (sem posição) apesar de pagar mais.
    const maiorPagador = page.getByTestId('proventos-kpi-maior-pagador');
    await expect(maiorPagador).toContainText('BBSE3');
    await expect(maiorPagador).not.toContainText('ITSA4');

    const topAtivos = page.getByTestId('proventos-top-ativos');
    await expect(topAtivos).toContainText('BBSE3');
    await expect(topAtivos).not.toContainText('ITSA4');

    // Totais/gráfico mantêm o histórico completo (100 + 500 = 600), incluindo o vendido.
    await expect(page.getByTestId('proventos-resumo')).toContainText('R$ 600,00');
  });
});
