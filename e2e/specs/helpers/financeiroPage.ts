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

export async function gotoFinanceiroMetasHistorico(page: Page): Promise<void> {
  await page.goto('/financeiro/metas/historico', { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-metas-historico-heading')).toBeVisible({
    timeout: 15_000
  });
}

export async function gotoFinanceiroRenda(page: Page, yearMonth: string): Promise<void> {
  await page.goto(`/financeiro/renda/${yearMonth}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-renda-heading')).toBeVisible({ timeout: 15_000 });
}

export async function gotoFinanceiroControle(page: Page, yearMonth: string): Promise<void> {
  await page.goto(`/financeiro/controle/${yearMonth}`, { waitUntil: 'domcontentloaded' });
  await expect(page.getByTestId('financeiro-controle-heading')).toBeVisible({ timeout: 15_000 });
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

export async function saveBudgetTargets(
  page: Page,
  options: { applyToFollowingMonths?: boolean } = {}
): Promise<void> {
  const applyFollowing = options.applyToFollowingMonths !== false;
  await page.getByTestId('budget-save-targets-btn').click();
  await page.getByTestId('budget-save-targets-modal').waitFor({ state: 'visible' });
  const following = page.getByTestId('budget-save-targets-following-months');
  if ((await following.isChecked()) !== applyFollowing) {
    await following.click();
  }
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/targets') &&
      response.request().method() === 'PUT' &&
      response.ok()
  );
  await page.getByTestId('budget-save-targets-confirm').click();
  await responsePromise;
  await page.getByTestId('budget-save-targets-modal').waitFor({ state: 'hidden' });
}

export async function saveBudgetIncomes(page: Page): Promise<void> {
  await page.getByTestId('budget-save-incomes-btn').click();
}

/** Cria uma meta personalizada pela UI da aba Metas e aguarda a persistência da categoria. */
export async function createCustomBudgetMeta(
  page: Page,
  name: string,
  options: { color?: string; applyToFollowingMonths?: boolean } | string = {}
): Promise<void> {
  // Compat: createCustomBudgetMeta(page, name, '#0ea5e9')
  const opts =
    typeof options === 'string'
      ? { color: options, applyToFollowingMonths: true }
      : { color: '#0ea5e9', applyToFollowingMonths: true, ...options };

  await page.getByTestId('budget-add-meta-btn').click();
  await page.getByTestId('budget-add-meta-modal').waitFor({ state: 'visible' });
  await page.getByTestId('budget-new-category-name').fill(name);
  await page.getByTestId('budget-new-category-color').fill(opts.color ?? '#0ea5e9');

  const following = page.getByTestId('budget-add-meta-following-months');
  const checked = await following.isChecked();
  if (checked !== Boolean(opts.applyToFollowingMonths)) {
    await following.click();
  }

  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/categories') &&
      response.request().method() === 'POST' &&
      response.ok()
  );
  await page.getByTestId('budget-create-category-btn').click();
  await responsePromise;
  await page.getByTestId('budget-add-meta-modal').waitFor({ state: 'hidden' });
}

/** Ajusta o percentual de uma meta pelo input numérico do card. */
export async function setBudgetTargetPercent(
  page: Page,
  categoryId: number,
  percent: number
): Promise<void> {
  const input = page.getByTestId(`budget-target-percent-input-${categoryId}`);
  await input.click();
  await input.fill(String(percent));
  await input.blur();
}

/** Confirma a remoção de uma meta do mês (modal). Bloqueia se houver despesa/recorrência. */
export async function removeBudgetMetaFromMonth(
  page: Page,
  categoryId: number,
  options: { applyToFollowingMonths?: boolean; expectBlocked?: boolean } = {}
): Promise<void> {
  const applyFollowing = options.applyToFollowingMonths !== false;
  await page.getByTestId(`budget-target-remove-${categoryId}`).click();
  await page.getByTestId('budget-remove-target-modal').waitFor({ state: 'visible' });
  const following = page.getByTestId('budget-remove-target-following-months');
  if ((await following.isChecked()) !== applyFollowing) {
    await following.click();
  }
  const responsePromise = page.waitForResponse(
    (response) =>
      response.url().includes('/remove-categories') && response.request().method() === 'POST'
  );
  await page.getByTestId('budget-remove-target-confirm').click();
  const response = await responsePromise;
  if (options.expectBlocked) {
    expect(response.status()).toBe(409);
    return;
  }
  expect(response.ok()).toBeTruthy();
  await page.getByTestId('budget-remove-target-modal').waitFor({ state: 'hidden' });
}

/** Navega para o próximo mês usando a barra de navegação de mês. */
export async function gotoNextBudgetMonth(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Próximo mês' }).click();
}

/**
 * Passa o mouse sobre o anel de um donut (gráfico de distribuição). Necessário porque
 * uma fatia de 100% forma um anel completo cujo centro do bounding box é o "buraco":
 * um hover no centro não acionaria o `mouseenter` do path.
 */
export async function hoverBudgetDonutSlice(page: Page, pieTestId: string): Promise<void> {
  const path = page.getByTestId(pieTestId).locator('path').first();
  const box = await path.boundingBox();
  if (!box) {
    throw new Error(`donut path bounding box not found for ${pieTestId}`);
  }
  await page.mouse.move(box.x + box.width / 2, box.y + Math.max(2, box.height * 0.06));
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
