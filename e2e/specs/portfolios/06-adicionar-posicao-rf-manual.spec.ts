import { expect, test } from '../fixtures/test';


import { E2E_CDB_IDENTIFIER, E2E_PORTFOLIO_PRINCIPAL } from '../helpers/e2eFixtures';
import {
  clickAddPosition,
  createPortfolioViaUI,
  fillManualPosition,
  gotoPortfoliosPage,
  pickAssetInAddForm,
  expectPositionRow
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalOnly } from '../helpers/seedPortfolios';
import { seedManualFixedIncome } from '../helpers/seedAssets';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-006 — Adicionar posição manual de renda fixa
 * @see ../../../casos-de-uso/ui/portfolios/06-adicionar-posicao-rf-manual.md
 */
test.describe('UI-PRT-006', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosPrincipalOnly(request);
    await seedManualFixedIncome(request);
  });

  test('adiciona posição RF manual', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await createPortfolioViaUI(page, E2E_PORTFOLIO_PRINCIPAL);
    await pickAssetInAddForm(page, 'E2E-CDB');
    await fillManualPosition(page, {
      invested: '10000',
      current: '10500',
      yield: 'IPCA + 8,4% a.a.'
    });
    await clickAddPosition(page);
    await expectPositionRow(page, E2E_CDB_IDENTIFIER);

    await page.reload();
    await expectPositionRow(page, E2E_CDB_IDENTIFIER);
  });
});
