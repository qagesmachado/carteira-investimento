import { expect, test } from '../../fixtures/test';


import {
  gotoFinanciamentoImovelPage,
  selectFinancingTabById,
  selectResumoTab
} from '../../helpers/financiamentoImovelPage';
import {
  createEntryViaApi,
  createFinancingViaApi,
  seedPropertyFinancingEmpty,
  todayIsoDate
} from '../../helpers/seedPropertyFinancing';

/** @see ../../../../casos-de-uso/ui/ferramentas/financiamento-imovel/README.md UI-FERR-005 */
test.describe('UI-FERR-005', () => {
  test('KPIs e gráfico refletem receitas vs despesas', async ({ page, request }) => {
    const portfolioId = await seedPropertyFinancingEmpty(request);
    const eventDate = todayIsoDate();
    const financingId = await createFinancingViaApi(
      request,
      portfolioId,
      'Galpão Industrial',
      'galpao'
    );
    await createEntryViaApi(request, portfolioId, financingId, {
      event_date: eventDate,
      entry_type: 'expense',
      event_category: 'financiamento',
      description: 'Parcela',
      amount_brl: 4000
    });
    await createEntryViaApi(request, portfolioId, financingId, {
      event_date: eventDate,
      entry_type: 'income',
      event_category: 'aluguel',
      description: 'Aluguel',
      amount_brl: 3000
    });

    await gotoFinanciamentoImovelPage(page);
    await selectFinancingTabById(page, financingId);
    await expect(page.getByTestId('financing-cashflow-chart')).toBeVisible();
    await expect(page.getByTestId('detail-profit')).toContainText(/1\.000,00/);
    await expect(page.getByTestId('detail-total-income')).toContainText(/3\.000,00/);

    await selectResumoTab(page);
    await expect(page.getByTestId('summary-profit')).toContainText(/1\.000,00/);
    await expect(page.getByTestId('summary-total-income')).toContainText(/3\.000,00/);
    await expect(page.getByTestId('financing-cashflow-chart')).toBeVisible();
  });
});
