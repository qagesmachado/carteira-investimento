import { expect, test } from '../fixtures/test';


import { gotoProventosListPage, paymentsTable } from '../helpers/proventosPage';
import { seedProventosForLabels } from '../helpers/seedProventos';

/**
 * UI-PRV-013 — Rótulos de tipo em português
 * @see ../../../casos-de-uso/ui/proventos/13-rotulos-tipo-portugues.md
 */
test.describe('UI-PRV-013', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosForLabels(request);
  });

  test('exibe tipos traduzidos na tabela', async ({ page }) => {
    await gotoProventosListPage(page);

    const table = paymentsTable(page);
    await expect(table).toContainText('Dividendo');
    await expect(table).toContainText('JCP');
    await expect(table).toContainText('Crédito');
    await expect(table).toContainText('Fração');
    await expect(table).toContainText('Resgate');
    await expect(table).toContainText('Outro');
  });
});
