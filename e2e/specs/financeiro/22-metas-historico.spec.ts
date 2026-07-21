import { expect, test } from '../fixtures/test';

import {
  createCustomBudgetMeta,
  gotoFinanceiroMetas,
  gotoFinanceiroMetasHistorico
} from '../helpers/financeiroPage';
import {
  createBudgetExpenseViaApi,
  currentBudgetYearMonth,
  listBudgetCategoriesViaApi,
  seedBudgetProfile,
  updateBudgetIncomesViaApi
} from '../helpers/seedBudget';
import { getWorkerApiBaseUrl } from '../helpers/workerContext';

/** @see ../../casos-de-uso/ui/financeiro/22-metas-historico.md */
test.describe('UI-FIN-022', () => {
  let profileId = 0;
  let categoryId = 0;
  const yearMonth = currentBudgetYearMonth();
  const metaName = 'Histórico E2E';

  test.beforeEach(async ({ request, page }) => {
    const profile = await seedBudgetProfile(request);
    profileId = profile.id;
    await updateBudgetIncomesViaApi(request, profileId, yearMonth, [
      { label: 'Salário', amount_brl: 10_000 }
    ]);
    await gotoFinanceiroMetas(page);
    await createCustomBudgetMeta(page, metaName, { applyToFollowingMonths: false });
    const categories = await listBudgetCategoriesViaApi(request, profileId);
    const created = categories.find((c: { name: string }) => c.name === metaName);
    expect(created).toBeTruthy();
    categoryId = created.id;
    await createBudgetExpenseViaApi(request, profileId, yearMonth, {
      description: 'Gasto histórico',
      amount_brl: 50,
      category_id: categoryId
    });
  });

  test('limpa despesas e exclui meta definitiva do catálogo', async ({ page, request }) => {
    await gotoFinanceiroMetasHistorico(page);
    await expect(page.getByTestId(`budget-metas-historico-row-${categoryId}`)).toBeVisible();
    await expect(page.getByTestId(`budget-metas-historico-tx-count-${categoryId}`)).toHaveText(
      '1'
    );

    await page.getByTestId(`budget-metas-historico-open-${categoryId}`).click();
    await expect(page.getByTestId('budget-metas-historico-detail-modal')).toBeVisible();
    await expect(page.getByTestId('budget-metas-historico-delete-category')).toBeDisabled();

    await page.getByTestId('budget-metas-historico-clear-expenses').click();
    await expect(page.getByTestId('budget-metas-historico-clear-confirm')).toBeVisible();
    const clearPromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/categories/${categoryId}/expenses`) &&
        response.request().method() === 'DELETE' &&
        response.ok()
    );
    await page.getByTestId('budget-metas-historico-clear-confirm-btn').click();
    await clearPromise;

    await expect(page.getByTestId('budget-metas-historico-delete-category')).toBeEnabled();
    await page.getByTestId('budget-metas-historico-delete-category').click();
    const deletePromise = page.waitForResponse(
      (response) =>
        response.url().includes(`/categories/${categoryId}`) &&
        !response.url().includes('/expenses') &&
        !response.url().includes('/usage') &&
        response.request().method() === 'DELETE' &&
        response.ok()
    );
    await page.getByTestId('budget-metas-historico-delete-confirm-btn').click();
    await deletePromise;

    await expect(page.getByTestId(`budget-metas-historico-row-${categoryId}`)).toHaveCount(0);

    const remaining = await listBudgetCategoriesViaApi(request, profileId);
    expect(remaining.map((c: { name: string }) => c.name)).not.toContain(metaName);

    await gotoFinanceiroMetas(page);
    await page.getByTestId('budget-add-meta-btn').click();
    await expect(page.getByTestId('budget-add-meta-modal')).toBeVisible();
    const select = page.getByTestId('budget-add-meta-select');
    if ((await select.count()) > 0) {
      await expect(select.locator('option', { hasText: metaName })).toHaveCount(0);
    }

    // Garante que a API do catálogo também não lista mais a meta.
    const apiBaseUrl = getWorkerApiBaseUrl();
    const listed = await request.get(`${apiBaseUrl}/budget/profiles/${profileId}/categories`);
    expect(listed.ok()).toBeTruthy();
    expect((await listed.json()).map((c: { name: string }) => c.name)).not.toContain(metaName);
  });
});
