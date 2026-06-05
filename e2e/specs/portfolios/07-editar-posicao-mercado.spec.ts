import { expect, test } from '../fixtures/test';


import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  clickEditPosition,
  editPositionModal,
  fillBrDecimalByLabel,
  gotoPortfoliosPage
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalWithBbse3 } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-007 — Editar posição de mercado
 * @see ../../../casos-de-uso/ui/portfolios/07-editar-posicao-mercado.md
 */
test.describe('UI-PRT-007', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosPrincipalWithBbse3(request);
  });

  test('edita quantidade da posição BBSE3', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await clickEditPosition(page, TICKER_BBSE3);
    await expect(page.getByRole('heading', { name: /Editar posição/ })).toBeVisible();

    const patchResponse = page.waitForResponse(
      (r) => r.request().method() === 'PATCH' && r.url().includes('/positions/') && r.ok()
    );
    await fillBrDecimalByLabel(page, 'Quantidade', '150', editPositionModal(page));
    await editPositionModal(page).getByRole('button', { name: 'Salvar' }).click();
    await patchResponse;

    await expect(page.getByRole('alert').filter({ hasText: 'Posição atualizada.' })).toBeVisible();
  });
});
