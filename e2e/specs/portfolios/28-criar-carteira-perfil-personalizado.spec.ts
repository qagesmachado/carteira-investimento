import { expect, test } from '../fixtures/test';

import {
  createPortfolioViaUI,
  gotoPortfoliosHub
} from '../helpers/portfoliosPage';
import { seedPortfoliosEmptyAssetsOnly } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-028 — Criar carteira com perfil Personalizado
 * @see ../../../casos-de-uso/ui/portfolios/28-criar-carteira-perfil-personalizado.md
 */
test.describe('UI-PRT-028', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosEmptyAssetsOnly(request);
  });

  test('sliders customizados criam carteira e hub exibe Personalizado', async ({ page }) => {
    await gotoPortfoliosHub(page);

    const portfolioName = 'E2E Personalizado';
    await createPortfolioViaUI(page, portfolioName, {
      profileLabel: 'Personalizado',
      customAllocation: {
        fixed_income: 60,
        stocks: 15
      }
    });

    await page.goto('/portfolios');
    await expect(page.getByTestId('portfolio-hub-card').filter({ hasText: portfolioName })).toBeVisible();
    await expect(
      page
        .getByTestId('portfolio-hub-card')
        .filter({ hasText: portfolioName })
        .getByText('Perfil Personalizado')
    ).toBeVisible();
  });
});
