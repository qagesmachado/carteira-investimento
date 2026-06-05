import { expect, test } from '../../fixtures/test';


import {
  addFinancingEntryUi,
  createFinancingUi,
  gotoFinanciamentoImovelPage
} from '../../helpers/financiamentoImovelPage';
import { seedPropertyFinancingEmpty, todayBrDate } from '../../helpers/seedPropertyFinancing';

/** @see ../../../../casos-de-uso/ui/ferramentas/financiamento-imovel/README.md UI-FERR-003 */
test.describe('UI-FERR-003', () => {
  test('registra lançamento de parcela e aluguel', async ({ page, request }) => {
    await seedPropertyFinancingEmpty(request);
    await gotoFinanciamentoImovelPage(page);
    await createFinancingUi(page, { name: 'Apto Centro', propertyType: 'apartamento' });

    const date = todayBrDate();
    await addFinancingEntryUi(page, {
      date,
      entryType: 'Despesa',
      eventLabel: 'Financiamento',
      description: 'Parcela junho',
      amount: '3000'
    });
    await addFinancingEntryUi(page, {
      date,
      entryType: 'Receita',
      eventLabel: 'Aluguel',
      description: 'Aluguel junho',
      amount: '2500'
    });

    await expect(page.getByTestId('detail-profit')).toContainText(/500,00/);
    await expect(page.getByTestId('detail-capital-invested')).toContainText(/3\.000,00/);
    await expect(page.getByTestId('detail-total-income')).toContainText(/2\.500,00/);
  });
});
