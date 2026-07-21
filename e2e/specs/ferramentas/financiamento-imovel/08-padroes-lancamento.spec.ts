import { expect, test } from '../../fixtures/test';

import {
  applyEntryTemplateUi,
  createFinancingUi,
  deleteEntryTemplateUi,
  expectEntryTemplateModalEventCategory,
  expectFinancingEventFormPrefilled,
  gotoFinanciamentoImovelPage,
  openSaveAsTemplateModalUi,
  saveEntryTemplateFromFormUi,
  updateEntryTemplateUi
} from '../../helpers/financiamentoImovelPage';
import { seedPropertyFinancingEmpty, todayBrDate } from '../../helpers/seedPropertyFinancing';
import { getWorkerApiBaseUrl } from '../../helpers/workerContext';

/** @see ../../../../casos-de-uso/ui/financeiro/financiamento-imovel/08-padroes-lancamento.md UI-FERR-008 */
test.describe('UI-FERR-008', () => {
  test('cria, aplica, edita e exclui padrão de lançamento', async ({ page, request }) => {
    const profileId = await seedPropertyFinancingEmpty(request);
    await gotoFinanciamentoImovelPage(page);
    const financingAId = await createFinancingUi(page, {
      name: 'Apto Centro',
      propertyType: 'apartamento'
    });

    await saveEntryTemplateFromFormUi(page, {
      templateName: 'Parcela financiamento',
      entryType: 'Despesa',
      eventLabel: 'Financiamento',
      description: 'Parcela mensal',
      amount: '3000'
    });

    const snapshot = await request.get(
      `${getWorkerApiBaseUrl()}/budget/profiles/${profileId}/property-financings`
    );
    const templateId = (
      (await snapshot.json()) as {
        financings: Array<{ entry_templates: Array<{ id: number }> }>;
      }
    ).financings[0].entry_templates[0].id;

    await expect(page.getByTestId('financing-entry-template-select')).toContainText(
      'Parcela financiamento'
    );

    await page.getByTestId('financing-event-description').fill('');
    await page.getByTestId('financing-event-amount').click();
    await page.getByTestId('financing-event-amount').fill('');
    await page.getByTestId('financing-event-amount').blur();

    await applyEntryTemplateUi(page, 'Parcela financiamento');
    await expectFinancingEventFormPrefilled(page, {
      entryType: 'Despesa',
      eventLabel: 'Financiamento',
      description: 'Parcela mensal',
      amount: '3000'
    });

    const date = todayBrDate();
    await page.getByTestId('financing-event-date').fill(date);
    await page.getByTestId('financing-event-amount').click();
    await page.getByTestId('financing-event-amount').fill('3100,00');
    await page.getByTestId('financing-event-amount').dispatchEvent('input');
    await page.getByTestId('financing-event-amount').blur();
    const saveEntryResponse = page.waitForResponse(
      (response) =>
        response.url().includes('/property-financings/') &&
        response.url().includes('/entries') &&
        response.request().method() === 'POST'
    );
    await page.getByTestId('financing-event-submit').click();
    await saveEntryResponse;

    await page.getByTestId('financing-entry-template-manage').click();
    await page.getByTestId(`financing-entry-template-edit-${templateId}`).click();
    await expect(page.getByTestId('financing-entry-template-name')).toHaveValue(
      'Parcela financiamento'
    );
    await page.getByTestId('financing-entry-template-cancel').click();
    await expect(page.getByTestId('financing-entry-template-table')).toBeVisible();
    await page.getByTestId('financing-entry-template-modal-close').click();

    await updateEntryTemplateUi(page, templateId, {
      amount: '3200',
      description: 'Parcela revisada',
      expectedName: 'Parcela financiamento',
      expectedDescription: 'Parcela mensal',
      expectedAmount: '3000'
    });

    await applyEntryTemplateUi(page, 'Parcela financiamento');
    await expectFinancingEventFormPrefilled(page, {
      entryType: 'Despesa',
      eventLabel: 'Financiamento',
      description: 'Parcela revisada',
      amount: '3200'
    });

    await deleteEntryTemplateUi(page, templateId);
    await expect(page.getByTestId('financing-entry-template-select')).not.toContainText(
      'Parcela financiamento'
    );

    const financingBId = await createFinancingUi(page, {
      name: 'Casa Bairro',
      propertyType: 'casa'
    });
    expect(financingBId).not.toBe(financingAId);
    await expect(page.getByTestId('financing-entry-template-select')).not.toContainText(
      'Parcela financiamento'
    );
  });

  test('segundo padrão não herda evento do padrão anterior no modal', async ({ page, request }) => {
    await seedPropertyFinancingEmpty(request);
    await gotoFinanciamentoImovelPage(page);
    await createFinancingUi(page, { name: 'Apto Centro', propertyType: 'apartamento' });

    await saveEntryTemplateFromFormUi(page, {
      templateName: 'Aluguel',
      entryType: 'Receita',
      eventLabel: 'Aluguel',
      description: 'Aluguel mensal',
      amount: '1653'
    });

    await applyEntryTemplateUi(page, 'Aluguel');
    await openSaveAsTemplateModalUi(page, {
      entryType: 'Despesa',
      eventLabel: 'Outras taxas',
      description: 'Custo manutenção CC Caixa',
      amount: '16'
    });

    await expectEntryTemplateModalEventCategory(page, {
      entryType: 'Despesa',
      eventLabel: 'Outras taxas',
      forbiddenLabels: ['Aluguel']
    });
    await expect(page.getByTestId('financing-entry-template-description')).toHaveValue(
      'Custo manutenção CC Caixa'
    );
  });
});
