import { expect, test } from '../fixtures/test';

import { E2E_PORTFOLIO_AUX } from '../helpers/e2eFixtures';
import {
  editPortfolioFromHub,
  gotoPortfoliosHub
} from '../helpers/portfoliosPage';
import { seedPortfoliosAuxForRename } from '../helpers/seedPortfolios';

/**
 * UI-PRT-027 — Editar carteira no hub
 * @see ../../../casos-de-uso/ui/portfolios/27-editar-carteira-hub.md
 */
test.describe('UI-PRT-027', () => {
  test('atualiza titular e objetivo pelo modal do hub', async ({ page, request }) => {
    await seedPortfoliosAuxForRename(request);
    await gotoPortfoliosHub(page);
    await editPortfolioFromHub(page, E2E_PORTFOLIO_AUX, {
      holder: 'Gabriel',
      objective: 'Reserva pessoal.'
    });

    const card = page.getByTestId('portfolio-hub-card').filter({ hasText: E2E_PORTFOLIO_AUX });
    await expect(card.getByText('Titular: Gabriel')).toBeVisible();
    await expect(card.getByText('Reserva pessoal.')).toBeVisible();
    await expect(page.getByRole('alert').filter({ hasText: 'Carteira atualizada.' })).toBeVisible();
  });
});
