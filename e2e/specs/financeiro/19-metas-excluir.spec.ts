import { expect, test } from '../fixtures/test';

import {
  createCustomBudgetMeta,
  gotoFinanceiroMetas,
  removeBudgetMetaFromMonth
} from '../helpers/financeiroPage';
import {
  createBudgetExpenseViaApi,
  currentBudgetYearMonth,
  getMonthSnapshotViaApi,
  seedBudgetProfile,
  updateBudgetIncomesViaApi
} from '../helpers/seedBudget';
import { getWorkerApiBaseUrl } from '../helpers/workerContext';

/** @see ../../casos-de-uso/ui/financeiro/19-metas-excluir.md */
test.describe('UI-FIN-019', () => {
  let profileId = 0;
  let categoryWithExpenseId = 0;
  let categoryWithExpenseName = '';
  const yearMonth = currentBudgetYearMonth();

  test.beforeEach(async ({ request }) => {
    const profile = await seedBudgetProfile(request);
    profileId = profile.id;
    await updateBudgetIncomesViaApi(request, profileId, yearMonth, [
      { label: 'Salário', amount_brl: 10_000 }
    ]);
    const snapshot = await getMonthSnapshotViaApi(request, profileId, yearMonth);
    categoryWithExpenseId = snapshot.categories[0].category_id;
    categoryWithExpenseName = snapshot.categories[0].category_name;
    await createBudgetExpenseViaApi(request, profileId, yearMonth, {
      description: 'Energia',
      amount_brl: 200,
      category_id: categoryWithExpenseId
    });
  });

  test('bloqueia remover/excluir meta com despesa e permite excluir meta sem uso', async ({
    page,
    request
  }) => {
    await gotoFinanceiroMetas(page);

    // Remover do mês bloqueado: meta com despesa vinculada.
    await removeBudgetMetaFromMonth(page, categoryWithExpenseId, {
      applyToFollowingMonths: false,
      expectBlocked: true
    });
    await expect(page.getByText(/Não foi possível remover a meta/)).toBeVisible();
    await page.getByTestId('budget-remove-target-cancel').click();
    await expect(page.getByTestId(`budget-target-card-${categoryWithExpenseId}`)).toBeVisible();

    // Exclusão do catálogo bloqueada.
    await page.getByTestId(`budget-target-edit-${categoryWithExpenseId}`).click();
    await page.getByTestId('budget-delete-category-btn').click();
    await expect(page.getByText(/Não foi possível remover a meta/)).toBeVisible();
    await page.getByRole('button', { name: 'Cancelar' }).click();

    // Exclusão permitida: meta personalizada recém-criada, sem despesa.
    await createCustomBudgetMeta(page, 'Descartável');
    await expect(page.getByText('Descartável').first()).toBeVisible();
    await page.getByRole('button', { name: 'Editar' }).last().click();
    const deletePromise = page.waitForResponse(
      (response) =>
        response.url().includes('/categories/') &&
        response.request().method() === 'DELETE' &&
        response.ok()
    );
    await page.getByTestId('budget-delete-category-btn').click();
    await deletePromise;
    await expect(page.getByText('Descartável')).toHaveCount(0);
    await expect(page.getByText(categoryWithExpenseName).first()).toBeVisible();

    // Remover também bloqueado com recorrente.
    const cats = await getMonthSnapshotViaApi(request, profileId, yearMonth);
    const freeId = cats.categories.find(
      (c: { category_id: number }) => c.category_id !== categoryWithExpenseId
    )!.category_id;
    const apiBaseUrl = getWorkerApiBaseUrl();
    const recurring = await request.post(
      `${apiBaseUrl}/budget/profiles/${profileId}/months/${yearMonth}/expenses`,
      {
        data: {
          description: 'Assinatura',
          event_date: `${yearMonth}-05`,
          amount_brl: 40,
          category_id: freeId,
          recurring: true,
          indefinite: true
        }
      }
    );
    expect(recurring.ok()).toBeTruthy();
    await gotoFinanceiroMetas(page);
    await removeBudgetMetaFromMonth(page, freeId, {
      applyToFollowingMonths: false,
      expectBlocked: true
    });
    await expect(page.getByText(/Não foi possível remover a meta/)).toBeVisible();
  });
});
