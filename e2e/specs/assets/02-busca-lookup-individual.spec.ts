import { expect, test } from '../fixtures/test';


import { isApiAssetsListResponse, isApiLookupResponse } from '../helpers/apiResponses';
import {
  deleteAssetBySymbolIfExists,
  LOOKUP_SUCCESS_MESSAGE,
  lookupForm,
  registeredAssetsTable,
  reviewForm,
  SAVE_SUCCESS_MESSAGE
} from '../helpers/assetsPage';
import { TICKER_BBSE3 } from '../helpers/bbse3Fixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import {
  expectRegisteredAssetRowYfinance,
  expectReviewFormYfinanceBbse3
} from '../helpers/reviewForm';

/**
 * UI-AST-002R — Busca e cadastro via lookup individual com yfinance real
 * @see ../../../casos-de-uso/ui/assets/02-busca-lookup-individual-rede.md
 */
test.describe('UI-AST-002R', () => {
  test.beforeEach(async ({ request }) => {
    await assertYfinanceLookupBackend(request);
    await deleteAssetBySymbolIfExists(request, TICKER_BBSE3);
  });

  test('cadastra ativo via busca yfinance e persiste na base de teste', async ({ page }) => {
    test.setTimeout(90_000);

    const listAssetsResponse = page.waitForResponse(
      (response) => isApiAssetsListResponse(response, 'GET') && response.ok()
    );

    await page.goto('/assets');
    await listAssetsResponse;

    await expect(page.getByText('Não foi possível carregar os ativos cadastrados.')).not.toBeVisible();
    await expect(page.locator('table tbody tr').filter({ hasText: TICKER_BBSE3 })).toHaveCount(0);

    const form = lookupForm(page);
    const searchInput = form.getByRole('textbox', { name: 'Ticker ou símbolo' });

    await searchInput.fill(TICKER_BBSE3);
    await expect(searchInput).toHaveValue(TICKER_BBSE3);

    const lookupResponse = page.waitForResponse(
      (response) => isApiLookupResponse(response) && response.ok(),
      { timeout: 45_000 }
    );
    await form.getByRole('button', { name: 'Buscar ativo' }).click();
    await lookupResponse;

    await expect(page.getByRole('button', { name: 'Buscando...' })).toBeHidden({ timeout: 45_000 });
    await expect(page.locator('[role="alert"].alert-error')).toHaveCount(0);
    await expect(page.getByRole('alert').filter({ hasText: LOOKUP_SUCCESS_MESSAGE })).toBeVisible();

    const formReview = reviewForm(page);
    await expectReviewFormYfinanceBbse3(formReview);

    const createAssetResponse = page.waitForResponse(
      (response) => isApiAssetsListResponse(response, 'POST') && response.ok(),
      { timeout: 45_000 }
    );
    await formReview.getByRole('button', { name: 'Salvar ativo' }).click();
    await createAssetResponse;

    await expect(page.getByRole('alert').filter({ hasText: SAVE_SUCCESS_MESSAGE })).toBeVisible();

    await expectRegisteredAssetRowYfinance(registeredAssetsTable(page));

    const listAfterReload = page.waitForResponse(
      (response) => isApiAssetsListResponse(response, 'GET') && response.ok()
    );
    await page.reload();
    await listAfterReload;

    await expect(page.getByText('Não foi possível carregar os ativos cadastrados.')).not.toBeVisible();
    await expectRegisteredAssetRowYfinance(registeredAssetsTable(page));
  });
});
