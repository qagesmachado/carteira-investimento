import { expect, test } from '@playwright/test';

import { gotoProventosPage, paymentsListSection, paymentsTable } from '../helpers/proventosPage';
import { seedProventosSeparacaoPorCarteira } from '../helpers/seedProventos';

/**
 * UI-PRV-016 - Filtro por carteira na listagem de proventos
 * @see ../../../casos-de-uso/ui/proventos/16-filtro-carteira-listagem.md
 */
test.describe('UI-PRV-016', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosSeparacaoPorCarteira(request);
  });

  test('listagem filtra por carteira, com default na ativa', async ({ page }) => {
    await gotoProventosPage(page);

    const section = paymentsListSection(page);
    const portfolioFilter = section.getByLabel('Filtrar por carteira');

    // Carteira A e a ativa do seed; default do filtro deve ser ela.
    await expect(portfolioFilter).toHaveValue(/\d+/);
    const rows = paymentsTable(page).locator('tr');
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Carteira A');
    await expect(rows.first()).toContainText('R$ 50,00');

    // Troca filtro para Carteira B.
    await portfolioFilter.selectOption({ label: 'Carteira B' });
    await expect(rows).toHaveCount(1);
    await expect(rows.first()).toContainText('Carteira B');
    await expect(rows.first()).toContainText('R$ 12,00');

    // Mostra todas.
    await portfolioFilter.selectOption({ value: '' });
    await expect(rows).toHaveCount(2);
  });
});
