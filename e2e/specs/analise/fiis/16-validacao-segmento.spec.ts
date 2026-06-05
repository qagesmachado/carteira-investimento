import { expect, test } from '../../fixtures/test';


import { gotoFiiSegmentosPage } from '../../helpers/analisePage';
import { seedAnalysisEmpty } from '../../helpers/seedAnalysis';

/**
 * UI-ANL-016 — Validação ao salvar segmento FII
 * @see ../../../casos-de-uso/ui/analise/fiis/16-validacao-segmento.md
 */
test.describe('UI-ANL-016', () => {
  test.beforeEach(async ({ request }) => {
    await seedAnalysisEmpty(request);
  });

  test('impede salvar segmento com campos vazios', async ({ page }) => {
    await gotoFiiSegmentosPage(page);
    const initialCards = page.locator('.card-body .rounded-lg.border');
    const initialCount = await initialCards.count();

    await page.getByRole('button', { name: 'Adicionar' }).click();
    await expect(initialCards).toHaveCount(initialCount + 1);
    await page.getByRole('button', { name: 'Salvar' }).click();

    await expect(page.getByRole('alert').filter({ hasText: /preencha/i })).toBeVisible();
    await expect(page.getByRole('alert').filter({ hasText: 'Segmentos salvos.' })).toHaveCount(0);
  });
});
