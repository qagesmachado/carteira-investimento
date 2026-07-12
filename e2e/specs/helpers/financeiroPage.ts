import { expect, type Page } from '@playwright/test';

async function fillBrDecimalTestInput(page: Page, testId: string, value: string): Promise<void> {
  const input = page.getByTestId(testId);
  await input.click();
  await input.fill(value);
  await input.dispatchEvent('input');
  await input.blur();
}

export async function gotoFinanceiroPainel(page: Page): Promise<void> {
  await page.goto('/financeiro', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-painel-heading')).toBeVisible({ timeout: 15_000 });
}

export async function gotoFinanceiroOrcamento(page: Page, yearMonth: string): Promise<void> {
  await page.goto(`/financeiro/orcamento/${yearMonth}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-orcamento-heading')).toBeVisible({ timeout: 15_000 });
}

export async function gotoFinanceiroDespesas(page: Page, yearMonth: string): Promise<void> {
  await page.goto(`/financeiro/despesas/${yearMonth}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-despesas-heading')).toBeVisible({ timeout: 15_000 });
}

export async function gotoFinanceiroMetas(page: Page): Promise<void> {
  await page.goto('/financeiro/metas', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-metas-heading')).toBeVisible({ timeout: 15_000 });
}

export async function gotoFinanceiroTags(page: Page): Promise<void> {
  await page.goto('/financeiro/metas/tags', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-tags-heading')).toBeVisible({ timeout: 15_000 });
}

export async function gotoFinanceiroRenda(page: Page, yearMonth: string): Promise<void> {
  await page.goto(`/financeiro/renda/${yearMonth}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-renda-heading')).toBeVisible({ timeout: 15_000 });
}

export async function gotoFinanceiroPerfis(page: Page): Promise<void> {
  await page.goto('/financeiro/perfis', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-perfis-heading')).toBeVisible({ timeout: 15_000 });
}

export async function selectBudgetProfile(page: Page, profileName: string): Promise<void> {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/budget/active') &&
      response.request().method() === 'PUT' &&
      response.ok()
  );
  await page.getByTestId('budget-profile-select').selectOption({ label: profileName });
  await responsePromise;
}

export async function createBudgetProfileFromUi(
  page: Page,
  name: string,
  description = ''
): Promise<void> {
  await gotoFinanceiroPerfis(page);
  await page.getByTestId('budget-profile-name').fill(name);
  if (description) {
    await page.getByTestId('budget-profile-description').fill(description);
  }
  await page.getByTestId('budget-profile-save').click();
  await expect(page.locator('tr').filter({ hasText: name })).toBeVisible();
}

export async function saveBudgetTargets(page: Page): Promise<void> {
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/targets') &&
      response.request().method() === 'PUT' &&
      response.ok()
  );
  await page.getByTestId('budget-save-targets-btn').click();
  await responsePromise;
}

export async function saveBudgetIncomes(page: Page): Promise<void> {
  await page.getByTestId('budget-save-incomes-btn').click();
}

export async function addBudgetExpenseFromUi(
  page: Page,
  options: {
    description: string;
    amount: string;
    categoryName?: string;
    tagName?: string;
    yearMonth?: string;
  }
): Promise<void> {
  if (options.yearMonth) {
    await gotoFinanceiroDespesas(page, options.yearMonth);
  }
  await page.getByTestId('budget-expense-description').fill(options.description);
  await fillBrDecimalTestInput(page, 'budget-expense-amount', options.amount);
  if (options.categoryName) {
    await page.getByTestId('budget-expense-category').selectOption({ label: options.categoryName });
  }
  if (options.tagName) {
    await page.getByTestId('budget-expense-tag').selectOption({ label: options.tagName });
  }
  await page.getByTestId('budget-expense-save').click();
}

export { fillBrDecimalTestInput };
