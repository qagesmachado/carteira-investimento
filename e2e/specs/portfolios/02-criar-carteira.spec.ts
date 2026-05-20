import { expect, test } from '@playwright/test';

import { E2E_PORTFOLIO_PRINCIPAL } from '../helpers/e2eFixtures';
import {
  createPortfolioViaUI,
  expectPortfolioActive,
  gotoPortfoliosPage
} from '../helpers/portfoliosPage';
import { seedPortfoliosPrincipalOnly } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-002 — Criar carteira E2E Principal
 * @see ../../../casos-de-uso/ui/portfolios/02-criar-carteira.md
 */
test.describe('UI-PRT-002', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosPrincipalOnly(request);
  });

  test('cria carteira e torna ativa', async ({ page }) => {
    await gotoPortfoliosPage(page);
    await createPortfolioViaUI(page, E2E_PORTFOLIO_PRINCIPAL);
    await expect(page.getByRole('button', { name: E2E_PORTFOLIO_PRINCIPAL })).toBeVisible();
    await expectPortfolioActive(page, E2E_PORTFOLIO_PRINCIPAL);

    await page.reload();
    await expect(page.getByRole('button', { name: E2E_PORTFOLIO_PRINCIPAL })).toBeVisible();
  });
});
