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
  await expect(page.getByRole('heading', { name: 'Ferramentas' })).toBeVisible();
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
  await page.getByLabel('Selecionar carteira').selectOption({ label: name });
}
