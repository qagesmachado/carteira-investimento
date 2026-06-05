import { expect, test } from '../fixtures/test';


import {
  gotoProventosPage,
  proventoFormSection,
  submitProventoFormWithoutWait
} from '../helpers/proventosPage';
import { seedProventosWithBbse3 } from '../helpers/seedProventos';

/**
 * UI-PRV-004 — Validação de campos obrigatórios
 * @see ../../../casos-de-uso/ui/proventos/04-validacao-campos-obrigatorios.md
 */
test.describe('UI-PRV-004', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosWithBbse3(request);
  });

  test('impede salvar sem ativo selecionado', async ({ page }) => {
    await gotoProventosPage(page);

    const postPromise = page
      .waitForRequest(
        (r) =>
          r.method() === 'POST' &&
          r.url().includes('/dividend-payments') &&
          !r.url().includes('/bulk'),
        { timeout: 1_000 }
      )
      .catch(() => null);

    await submitProventoFormWithoutWait(page);
    const postRequest = await postPromise;

    await expect(proventoFormSection(page).getByRole('alert')).toContainText('Selecione um ativo.');
    expect(postRequest).toBeNull();
  });
});
