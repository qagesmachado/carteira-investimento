import { expect, test } from '@playwright/test';

import { gotoProventosPage, paymentsListSection, proventoFormSection } from '../helpers/proventosPage';
import { seedProventosEmpty } from '../helpers/seedProventos';

/**
 * UI-PRV-001 — Carregamento da página de proventos
 * @see ../../../casos-de-uso/ui/proventos/01-carregamento.md
 */
test.describe('UI-PRV-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosEmpty(request);
  });

  test('carrega formulário e lista vazia', async ({ page }) => {
    await gotoProventosPage(page);

    await expect(page.getByRole('heading', { name: 'Proventos', level: 1 })).toBeVisible();
    await expect(proventoFormSection(page).getByText('Novo provento')).toBeVisible();
    await expect(proventoFormSection(page).getByRole('button', { name: 'Cadastrar provento' })).toBeVisible();
    await expect(paymentsListSection(page).getByText('Nenhum provento cadastrado ainda.')).toBeVisible();
    await expect(page.getByRole('alert')).toHaveCount(0);
  });
});
