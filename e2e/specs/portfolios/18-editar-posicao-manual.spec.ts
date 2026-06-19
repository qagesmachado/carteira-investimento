import { expect, test } from '../fixtures/test';


import { E2E_CDB_IDENTIFIER } from '../helpers/e2eFixtures';
import { clickEditPosition, gotoPortfoliosPage } from '../helpers/portfoliosPage';
import { saveFixedIncomeEdit } from '../helpers/fixedIncomePositionForm';
import { seedPortfoliosWithRfPosition } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-018 — Editar renda fixa na carteira (produto + valores numa ação)
 * @see ../../../casos-de-uso/ui/portfolios/18-editar-posicao-manual.md
 */
test.describe('UI-PRT-018', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosWithRfPosition(request);
  });

  test('edita valor da renda fixa no formulário unificado', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await clickEditPosition(page, E2E_CDB_IDENTIFIER);
    await saveFixedIncomeEdit(page, { invested: '12000' });
    await expect(page.getByRole('alert').filter({ hasText: 'Ativo atualizado.' })).toBeVisible();
  });
});
