import { expect, test } from '../../fixtures/test';


import {
  addFinancingEntryUi,
  createFinancingUi,
  gotoFinanciamentoImovelPage
} from '../../helpers/financiamentoImovelPage';
import { seedPropertyFinancingEmpty, todayBrDate } from '../../helpers/seedPropertyFinancing';

/** @see ../../../../casos-de-uso/ui/ferramentas/financiamento-imovel/README.md UI-FERR-004 */
test.describe('UI-FERR-004', () => {
  test('adiciona despesa de entrada do financiamento', async ({ page, request }) => {
    await seedPropertyFinancingEmpty(request);
    await gotoFinanciamentoImovelPage(page);
    await createFinancingUi(page, { name: 'Condomínio Alugado', propertyType: 'apartamento' });

    const date = todayBrDate();
    await addFinancingEntryUi(page, {
      date,
      entryType: 'Despesa',
      eventLabel: 'Financiamento',
      description: 'Parcela',
      amount: '2000'
    });
    await addFinancingEntryUi(page, {
      date,
      entryType: 'Receita',
      eventLabel: 'Aluguel',
      description: 'Aluguel líquido',
      amount: '1800'
    });
    await addFinancingEntryUi(page, {
      date,
      entryType: 'Despesa',
      eventLabel: 'Entrada do financiamento',
      description: 'Chamada capital condomínio',
      amount: '600'
    });

    await expect(page.getByRole('cell', { name: 'Entrada do financiamento' })).toBeVisible();
    await expect(page.getByTestId('detail-profit')).toContainText(/800,00/);
  });
});
