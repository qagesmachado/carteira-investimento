import { expect, type Page } from '@playwright/test';

async function fillBrDecimalTestInput(page: Page, testId: string, value: string): Promise<void> {
  const input = page.getByTestId(testId);
  await input.click();
  await input.fill(value);
  await input.dispatchEvent('input');
  await input.blur();
}

export async function gotoFinanciamentoImovelPage(page: Page): Promise<void> {
  await page.goto('/ferramentas/financiamento-imovel');
  await expect(page.getByRole('heading', { name: 'Financiamento imóvel' })).toBeVisible();
}

export async function selectFinancingTab(page: Page, name: string): Promise<void> {
  await page.getByRole('button', { name: new RegExp(`^${name}`) }).click();
  if (name === 'Resumo') {
    await expect(page.getByTestId('financing-summary')).toBeVisible();
  } else {
    await expect(page.getByTestId('financing-detail')).toBeVisible();
  }
}

export async function selectFinancingTabById(page: Page, financingId: number): Promise<void> {
  await page.getByTestId(`financing-tab-${financingId}`).click();
  await expect(page.getByTestId('financing-detail')).toBeVisible();
}

export async function selectResumoTab(page: Page): Promise<void> {
  await page.getByTestId('financing-tab-resumo').click();
  await expect(page.getByTestId('financing-summary')).toBeVisible();
}

export async function createFinancingUi(
  page: Page,
  options: {
    name: string;
    propertyType?: string;
  }
): Promise<number> {
  await page.getByTestId('financing-create-btn').click();
  await page.getByTestId('financing-edit-name').fill(options.name);
  if (options.propertyType) {
    await page.getByTestId('financing-edit-type').selectOption(options.propertyType);
  }
  const createResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/property-financings') &&
      response.request().method() === 'POST' &&
      response.status() === 201
  );
  await page.getByTestId('financing-edit-save').click();
  const response = await createResponse;
  const financingId = ((await response.json()) as { id: number }).id;
  await selectFinancingTabById(page, financingId);
  return financingId;
}

export async function addFinancingEntryUi(
  page: Page,
  options: {
    date: string;
    entryType: 'Receita' | 'Despesa';
    eventLabel: string;
    description: string;
    amount: string;
  }
): Promise<void> {
  await page.getByTestId('financing-event-date').fill(options.date);
  await page.getByTestId('financing-event-type').selectOption({ label: options.entryType });
  await page.getByTestId('financing-event-category').selectOption({ label: options.eventLabel });
  await page.getByTestId('financing-event-description').fill(options.description);
  await fillBrDecimalTestInput(page, 'financing-event-amount', `${options.amount},00`);
  const saveResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/property-financings/') &&
      response.url().includes('/entries') &&
      response.request().method() === 'POST'
  );
  await page.getByTestId('financing-event-submit').click();
  await saveResponse;
}

export async function selectPortfolioByName(page: Page, name: string): Promise<void> {
  await page.getByTestId('portfolio-select-header').selectOption({ label: name });
}

export async function fillFinancingEventFormFields(
  page: Page,
  options: {
    entryType: 'Receita' | 'Despesa';
    eventLabel: string;
    description: string;
    amount: string;
  }
): Promise<void> {
  await page.getByTestId('financing-event-type').selectOption({ label: options.entryType });
  await page.getByTestId('financing-event-category').selectOption({ label: options.eventLabel });
  await page.getByTestId('financing-event-description').fill(options.description);
  await fillBrDecimalTestInput(page, 'financing-event-amount', `${options.amount},00`);
}

export async function saveEntryTemplateFromFormUi(
  page: Page,
  options: {
    templateName: string;
    entryType: 'Receita' | 'Despesa';
    eventLabel: string;
    description: string;
    amount: string;
  }
): Promise<void> {
  await fillFinancingEventFormFields(page, options);
  await page.getByTestId('financing-entry-template-save-from-form').click();
  await page.getByTestId('financing-entry-template-name').fill(options.templateName);
  const saveResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/entry-templates') && response.request().method() === 'POST'
  );
  await page.getByTestId('financing-entry-template-save').click();
  await saveResponse;
}

export async function openSaveAsTemplateModalUi(
  page: Page,
  options: {
    entryType: 'Receita' | 'Despesa';
    eventLabel: string;
    description: string;
    amount: string;
  }
): Promise<void> {
  await fillFinancingEventFormFields(page, options);
  await page.getByTestId('financing-entry-template-save-from-form').click();
  await expect(page.getByTestId('financing-entry-template-form')).toBeVisible();
}

export async function expectEntryTemplateModalEventCategory(
  page: Page,
  options: {
    entryType: 'Receita' | 'Despesa';
    eventLabel: string;
    forbiddenLabels?: string[];
  }
): Promise<void> {
  await expect(page.getByTestId('financing-entry-template-type')).toHaveValue(
    options.entryType === 'Receita' ? 'income' : 'expense'
  );
  const categoryValue =
    options.eventLabel === 'Aluguel'
      ? 'aluguel'
      : options.eventLabel === 'Financiamento'
        ? 'financiamento'
        : options.eventLabel === 'Outras taxas'
          ? 'outras_taxas'
          : 'entrada_financiamento';
  const categorySelect = page.getByTestId('financing-entry-template-category');
  await expect(categorySelect).toHaveValue(categoryValue);
  const optionLabels = await categorySelect.locator('option').allTextContents();
  for (const forbiddenLabel of options.forbiddenLabels ?? []) {
    expect(optionLabels).not.toContain(forbiddenLabel);
  }
}

export async function applyEntryTemplateUi(page: Page, templateName: string): Promise<void> {
  await page.getByTestId('financing-entry-template-select').selectOption({ label: templateName });
  await page.getByTestId('financing-entry-template-apply').click();
}

export async function expectFinancingEventFormPrefilled(
  page: Page,
  options: {
    entryType: 'Receita' | 'Despesa';
    eventLabel: string;
    description: string;
    amount: string;
  }
): Promise<void> {
  await expect(page.getByTestId('financing-event-type')).toHaveValue(
    options.entryType === 'Receita' ? 'income' : 'expense'
  );
  const categoryValue =
    options.eventLabel === 'Aluguel'
      ? 'aluguel'
      : options.eventLabel === 'Financiamento'
        ? 'financiamento'
        : options.eventLabel === 'Outras taxas'
          ? 'outras_taxas'
          : 'entrada_financiamento';
  await expect(page.getByTestId('financing-event-category')).toHaveValue(categoryValue);
  await expect(page.getByTestId('financing-event-description')).toHaveValue(options.description);
  const amountDigits = options.amount.replace(/\D/g, '');
  const amountNumber = Number(amountDigits);
  const formattedAmount = amountNumber.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
  await expect(page.getByTestId('financing-event-amount')).toHaveValue(formattedAmount);
  await expect(page.getByTestId('financing-event-date')).toHaveValue('');
}

export async function updateEntryTemplateUi(
  page: Page,
  templateId: number,
  options: {
    amount: string;
    description: string;
    expectedName?: string;
    expectedDescription?: string;
    expectedAmount?: string;
  }
): Promise<void> {
  await page.getByTestId('financing-entry-template-manage').click();
  await page.getByTestId(`financing-entry-template-edit-${templateId}`).click();
  if (options.expectedName) {
    await expect(page.getByTestId('financing-entry-template-name')).toHaveValue(options.expectedName);
  }
  if (options.expectedDescription) {
    await expect(page.getByTestId('financing-entry-template-description')).toHaveValue(
      options.expectedDescription
    );
  }
  if (options.expectedAmount) {
    const amountNumber = Number(options.expectedAmount.replace(/\D/g, ''));
    const formattedAmount = amountNumber.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
    await expect(page.getByTestId('financing-entry-template-amount')).toHaveValue(formattedAmount);
  }
  await page.getByTestId('financing-entry-template-description').fill(options.description);
  await fillBrDecimalTestInput(
    page,
    'financing-entry-template-amount',
    `${options.amount},00`
  );
  const saveResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/entry-templates/') && response.request().method() === 'PATCH'
  );
  await page.getByTestId('financing-entry-template-save').click();
  await saveResponse;
  const manageModal = page.getByTestId('financing-entry-template-modal');
  if (await manageModal.isVisible()) {
    await page.getByTestId('financing-entry-template-modal-close').click();
  }
}

export async function deleteEntryTemplateUi(page: Page, templateId: number): Promise<void> {
  await page.getByTestId('financing-entry-template-manage').click();
  const deleteResponse = page.waitForResponse(
    (response) =>
      response.url().includes('/entry-templates/') && response.request().method() === 'DELETE'
  );
  await page.getByTestId(`financing-entry-template-delete-${templateId}`).click();
  await page.getByTestId('financing-entry-template-delete-confirm').click();
  await deleteResponse;
  const manageModal = page.getByTestId('financing-entry-template-modal');
  if (await manageModal.isVisible()) {
    await page.getByTestId('financing-entry-template-modal-close').click();
  }
}
