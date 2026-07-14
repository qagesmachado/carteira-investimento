import { expect, test } from '../fixtures/test';


import {
  createPortfolioViaUI,
  gotoPortfoliosHub
} from '../helpers/portfoliosPage';
import { seedPortfoliosEmptyAssetsOnly } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-026 — Criar carteira via modal
 * @see ../../../casos-de-uso/ui/portfolios/26-criar-carteira-modal.md
 */
test.describe('UI-PRT-026', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosEmptyAssetsOnly(request);
  });

  test('modal com perfil e template redireciona para posições', async ({ page }) => {
    await gotoPortfoliosHub(page);
    const portfolioId = await createPortfolioViaUI(page, 'E2E Modal Principal', {
      profileLabel: 'Moderado',
      templateLabel: 'Pessoal'
    });
    await expect(page.getByRole('heading', { name: 'Posições da carteira' })).toBeVisible();
    await expect(page).toHaveURL(new RegExp(`/portfolios/${portfolioId}$`));
  });
});
