import { expect, test } from '../fixtures/test';


import { E2E_PORTFOLIO_PRINCIPAL } from '../helpers/e2eFixtures';
import {
  createPortfolioViaUI,
  gotoPortfoliosHub,
  openCreatePortfolioModal
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalOnly } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-013 — Criar carteira nome obrigatório
 * @see ../../../casos-de-uso/ui/portfolios/13-criar-carteira-nome-obrigatorio.md
 */
test.describe('UI-PRT-013', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosPrincipalOnly(request);
  });

  test('modal exige nome da carteira', async ({ page }) => {
    await gotoPortfoliosHub(page);
    await openCreatePortfolioModal(page);
    await page.getByLabel('Nome da carteira').fill('');
    await page.getByRole('button', { name: 'Criar carteira' }).click();
    await expect(page.getByRole('alert')).toHaveText('Informe o nome da carteira.');
  });
});
