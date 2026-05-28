import { expect, test } from '@playwright/test';

import { API_BASE_URL, isApiAssetsListResponse } from '../helpers/apiResponses';
import { clearAllTestAssets } from '../helpers/testAssets';

/**
 * UI-AST-001 — Carregamento inicial da página /assets (nível complete / yfinance)
 * @see ../../../casos-de-uso/ui/assets/01-carregamento.md
 */
test.describe('UI-AST-001', () => {
  test.beforeEach(async ({ request }) => {
    await clearAllTestAssets(request, API_BASE_URL);
  });

  test('página carrega com lista vazia na base de teste', async ({ page }) => {
    const listAssetsResponse = page.waitForResponse(
      (response) => isApiAssetsListResponse(response, 'GET') && response.ok()
    );

    await page.goto('/assets');
    await listAssetsResponse;

    await expect(
      page.getByRole('heading', { name: 'Cadastro de ativos no banco de dados' })
    ).toBeVisible();

    await expect(page.getByText('Nenhum ativo cadastrado ainda.')).toBeVisible();
    await expect(page.getByText('0 ativos', { exact: true })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Buscar ativo' })).toBeVisible();
    await expect(page.getByLabel('Ticker ou símbolo')).toBeVisible();
    await expect(page.locator('table tbody tr')).toHaveCount(0);
    await expect(page.locator('[role="alert"].alert-error')).toHaveCount(0);
  });
});
