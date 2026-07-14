import { test } from '../fixtures/test';


import {
  E2E_PENSION_IDENTIFIER,
  E2E_PENSION_NAME,
  E2E_PORTFOLIO_PRINCIPAL
} from '../helpers/e2eFixtures';
import {
  createPortfolioViaUI,
  gotoPortfoliosHub,
  expectPositionRow
} from '../helpers/portfoliosPage';
import { addPensionViaModal } from '../helpers/fixedIncomePositionForm';
import { seedPortfoliosEmpty } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-017 — Cadastrar previdência pelo modal unificado da carteira
 * @see ../../../casos-de-uso/ui/portfolios/17-adicionar-posicao-previdencia.md
 */
test.describe('UI-PRT-017', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosEmpty(request);
  });

  test('cadastra previdência (produto + valores) numa única ação', async ({ page }) => {
    await gotoPortfoliosHub(page);
    await createPortfolioViaUI(page, E2E_PORTFOLIO_PRINCIPAL);

    await addPensionViaModal(page, {
      symbol: E2E_PENSION_IDENTIFIER,
      name: E2E_PENSION_NAME,
      invested: '50000',
      current: '52000'
    });

    await expectPositionRow(page, E2E_PENSION_IDENTIFIER);
  });
});
