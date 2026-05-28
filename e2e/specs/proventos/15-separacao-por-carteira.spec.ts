import { expect, test } from '@playwright/test';

import { TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  clickPositionDetails,
  expectPositionDetailsVisible,
  gotoConsolidadaPage,
  selectPortfolioByName
} from '../helpers/consolidadaPage';
import { seedProventosSeparacaoPorCarteira } from '../helpers/seedProventos';

/**
 * UI-PRV-015 - Separacao de proventos por carteira
 * @see ../../../casos-de-uso/ui/proventos/15-separacao-por-carteira.md
 */
test.describe('UI-PRV-015', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosSeparacaoPorCarteira(request);
  });

  test('totais por ativo na consolidada nao misturam proventos de outra carteira', async ({ page }) => {
    await gotoConsolidadaPage(page);

    // Carteira A ativa (default do seed). Aguarda a tabela mostrar BBSE3.
    await expect(page.getByRole('cell', { name: TICKER_BBSE3 }).first()).toBeVisible();
    await clickPositionDetails(page, TICKER_BBSE3);
    await expectPositionDetailsVisible(page, /Dividendos recebidos.*R\$\s*50,00/);

    // Troca para Carteira B e verifica o outro total.
    await selectPortfolioByName(page, 'Carteira B');
    await expect(page.getByRole('cell', { name: TICKER_BBSE3 }).first()).toBeVisible();
    await clickPositionDetails(page, TICKER_BBSE3);
    await expectPositionDetailsVisible(page, /Dividendos recebidos.*R\$\s*12,00/);
  });
});
