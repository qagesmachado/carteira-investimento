import { expect, test } from '../fixtures/test';


import { E2E_CDB_IDENTIFIER, E2E_CDB_NAME, E2E_PORTFOLIO_PRINCIPAL } from '../helpers/e2eFixtures';
import {
  createPortfolioViaUI,
  gotoPortfoliosPage,
  expectPositionRow
} from '../helpers/portfoliosPage';
import { addFixedIncomeViaModal } from '../helpers/fixedIncomePositionForm';
import { seedPortfoliosEmpty } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-006 — Cadastrar renda fixa pelo modal unificado da carteira
 * @see ../../../casos-de-uso/ui/portfolios/06-adicionar-posicao-rf-manual.md
 */
test.describe('UI-PRT-006', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosEmpty(request);
  });

  test('cadastra CDB (produto + valores) numa única ação', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await createPortfolioViaUI(page, E2E_PORTFOLIO_PRINCIPAL);

    await addFixedIncomeViaModal(page, {
      symbol: E2E_CDB_IDENTIFIER,
      name: E2E_CDB_NAME,
      indexer: 'ipca_plus',
      yieldText: 'IPCA + 8,4% a.a.',
      invested: '10000',
      current: '10500'
    });

    await expectPositionRow(page, E2E_CDB_IDENTIFIER);

    await page.reload();
    await expectPositionRow(page, E2E_CDB_IDENTIFIER);
  });
});
