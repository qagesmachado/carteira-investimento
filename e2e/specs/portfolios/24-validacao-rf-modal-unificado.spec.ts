import { expect, test } from '../fixtures/test';


import { E2E_PORTFOLIO_PRINCIPAL } from '../helpers/e2eFixtures';
import {
  addAssetModal,
  createPortfolioViaUI,
  gotoPortfoliosHub,
  positionDataRows
} from '../helpers/portfoliosPage';
import { submitFixedIncomeModalEmpty } from '../helpers/fixedIncomePositionForm';
import { seedPortfoliosEmpty } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-024 — Validação de campos no modal unificado de renda fixa
 * @see ../../../casos-de-uso/ui/portfolios/24-validacao-rf-modal-unificado.md
 */
test.describe('UI-PRT-024', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosEmpty(request);
  });

  test('não cadastra renda fixa com campos obrigatórios vazios', async ({ page }) => {
    await gotoPortfoliosHub(page);
    await createPortfolioViaUI(page, E2E_PORTFOLIO_PRINCIPAL);

    await submitFixedIncomeModalEmpty(page);

    // O modal continua aberto (nada foi salvo) e nenhuma posição foi criada.
    await expect(addAssetModal(page)).toBeVisible();
    await expect(positionDataRows(page)).toHaveCount(0);
  });
});
