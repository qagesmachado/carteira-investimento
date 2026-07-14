import { expect, test } from '../fixtures/test';

import { E2E_PORTFOLIO_AUX } from '../helpers/e2eFixtures';
import { editPortfolioFromHub, gotoPortfoliosHub } from '../helpers/portfoliosPage';
import { seedPortfoliosAuxForRename } from '../helpers/seedPortfolios';

/**
 * UI-PRT-030 — Trava de exclusão no hub
 * @see ../../../casos-de-uso/ui/portfolios/30-trava-exclusao-carteira-hub.md
 */
test.describe('UI-PRT-030', () => {
  test('checkbox no editar desabilita Excluir no card', async ({ page, request }) => {
    await seedPortfoliosAuxForRename(request);
    await gotoPortfoliosHub(page);

    const card = page.getByTestId('portfolio-hub-card').filter({ hasText: E2E_PORTFOLIO_AUX });
    await expect(card.getByTestId('portfolio-hub-delete')).toBeEnabled();

    await editPortfolioFromHub(page, E2E_PORTFOLIO_AUX, { deleteLocked: true });

    await expect(card.getByTestId('portfolio-hub-delete')).toBeDisabled();
  });
});
