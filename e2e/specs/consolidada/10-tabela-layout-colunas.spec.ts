import { expect, test } from '@playwright/test';

import { gotoConsolidadaPage } from '../helpers/consolidadaPage';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedConsolidadaPrincipal } from '../helpers/seedConsolidada';

/**
 * UI-CNS-010 — Layout de colunas da tabela
 * @see ../../../casos-de-uso/ui/consolidada/10-tabela-layout-colunas.md
 */
test.describe('UI-CNS-010', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedConsolidadaPrincipal(request);
  });

  test('exibe cabeçalhos das colunas principais', async ({ page }) => {
    await gotoConsolidadaPage(page);
    const header = page.locator('table thead');
    for (const name of ['Ativo', 'Nome', 'Aplicado', 'Atual', 'Lucro']) {
      await expect(header.getByRole('button', { name })).toBeVisible();
    }
  });
});
