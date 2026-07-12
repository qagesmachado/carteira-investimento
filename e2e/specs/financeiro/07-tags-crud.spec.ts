import { expect, test } from '../fixtures/test';

import { gotoFinanceiroTags } from '../helpers/financeiroPage';
import {
  createBudgetTagViaApi,
  listBudgetTagsViaApi,
  seedBudgetProfile
} from '../helpers/seedBudget';

/** @see ../../casos-de-uso/ui/financeiro/07-tags-crud.md */
test.describe('UI-FIN-007', () => {
  let profileId = 0;

  test.beforeEach(async ({ request }) => {
    const profile = await seedBudgetProfile(request);
    profileId = profile.id;
  });

  test('cria, edita e exclui tag sem uso', async ({ page }) => {
    await gotoFinanceiroTags(page);
    await page.getByTestId('budget-tag-random-color').click();
    await expect(page.getByTestId('budget-tag-color')).toHaveValue(/#[0-9a-f]{6}/i);
    await page.getByTestId('budget-tag-name').fill('Transporte');
    await page.getByTestId('budget-tag-save').click();
    await expect(page.getByText('Transporte')).toBeVisible();

    await page.getByRole('button', { name: 'Editar' }).click();
    await page.getByTestId('budget-tag-name').fill('Transporte urbano');
    await page.getByTestId('budget-tag-save').click();
    await expect(page.getByText('Transporte urbano')).toBeVisible();

    await page.getByTestId(/budget-tag-delete-/).click();
    await expect(page.getByText('Transporte urbano')).toHaveCount(0);
  });

  test('deduplica cores iguais e evita reutilizar no formulário', async ({ page, request }) => {
    await createBudgetTagViaApi(request, profileId, 'Alimentação', '#3b82f6');
    await createBudgetTagViaApi(request, profileId, 'Alimentação fora', '#3b82f6');

    await gotoFinanceiroTags(page);
    await expect(page.getByText('Alimentação fora')).toBeVisible();

    await expect
      .poll(async () => {
        const tags = await listBudgetTagsViaApi(request, profileId);
        const colors = tags.map((tag) => tag.color.trim().toLowerCase());
        return new Set(colors).size === colors.length;
      })
      .toBe(true);

    const tags = await listBudgetTagsViaApi(request, profileId);
    const used = new Set(tags.map((tag) => tag.color.trim().toLowerCase()));

    const formColor = (await page.getByTestId('budget-tag-color').inputValue()).trim().toLowerCase();
    expect(used.has(formColor)).toBe(false);

    await page.getByTestId('budget-tag-random-color').click();
    const randomColor = (await page.getByTestId('budget-tag-color').inputValue()).trim().toLowerCase();
    expect(used.has(randomColor)).toBe(false);
  });
});
