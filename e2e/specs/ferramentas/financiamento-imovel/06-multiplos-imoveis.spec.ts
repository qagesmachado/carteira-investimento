import { expect, test } from '../../fixtures/test';


import { gotoFinanciamentoImovelPage } from '../../helpers/financiamentoImovelPage';
import {
  createEntryViaApi,
  createFinancingViaApi,
  seedPropertyFinancingEmpty,
  todayIsoDate
} from '../../helpers/seedPropertyFinancing';

/** @see ../../../../casos-de-uso/ui/ferramentas/financiamento-imovel/README.md UI-FERR-006 */
test.describe('UI-FERR-006', () => {
  test('resumo consolidado com múltiplos imóveis', async ({ page, request }) => {
    const portfolioId = await seedPropertyFinancingEmpty(request);
    const eventDate = todayIsoDate();
    const financingA = await createFinancingViaApi(request, portfolioId, 'Imóvel A', 'casa');
    const financingB = await createFinancingViaApi(request, portfolioId, 'Imóvel B', 'lote');
    await createEntryViaApi(request, portfolioId, financingA, {
      event_date: eventDate,
      entry_type: 'expense',
      event_category: 'financiamento',
      description: 'Parcela A',
      amount_brl: 1000
    });
    await createEntryViaApi(request, portfolioId, financingA, {
      event_date: eventDate,
      entry_type: 'income',
      event_category: 'aluguel',
      description: 'Aluguel A',
      amount_brl: 500
    });
    await createEntryViaApi(request, portfolioId, financingB, {
      event_date: eventDate,
      entry_type: 'expense',
      event_category: 'financiamento',
      description: 'Parcela B',
      amount_brl: 800
    });
    await createEntryViaApi(request, portfolioId, financingB, {
      event_date: eventDate,
      entry_type: 'income',
      event_category: 'aluguel',
      description: 'Aluguel B',
      amount_brl: 900
    });

    await gotoFinanciamentoImovelPage(page);
    await expect(
      page.getByTestId('financing-summary').locator('[data-testid^="financing-summary-row-"]')
    ).toHaveCount(2);
    await expect(page.getByTestId('summary-profit')).toContainText(/400,00/);
  });
});
