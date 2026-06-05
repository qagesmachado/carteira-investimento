import { expect, test } from '../fixtures/test';


import { E2E_CDB_IDENTIFIER } from '../helpers/e2eFixtures';
import {
  clickEditPosition,
  editPositionModal,
  fillBrDecimalByLabel,
  gotoPortfoliosPage
} from '../helpers/portfoliosPage';
import { seedPortfoliosWithRfPosition } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-018 — Editar posição manual
 * @see ../../../casos-de-uso/ui/portfolios/18-editar-posicao-manual.md
 */
test.describe('UI-PRT-018', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosWithRfPosition(request);
  });

  test('edita valor aplicado da posição RF', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await clickEditPosition(page, E2E_CDB_IDENTIFIER);
    const patchResponse = page.waitForResponse(
      (r) => r.request().method() === 'PATCH' && r.url().includes('/positions/') && r.ok()
    );
    await fillBrDecimalByLabel(page, /Valor aplicado/, '12000', editPositionModal(page));
    await editPositionModal(page).getByRole('button', { name: 'Salvar' }).click();
    await patchResponse;
    await expect(page.getByRole('alert').filter({ hasText: 'Posição atualizada.' })).toBeVisible();
  });
});
