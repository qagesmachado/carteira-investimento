import { expect, test } from '../../fixtures/test';


import {
  etfIntlAnalysisTableSection,
  gotoInternacionalPage
} from '../../helpers/analisePage';
import { seedEtfIntlAnalysis } from '../../helpers/seedEtfIntlAnalysis';

/**
 * UI-ANL-014 — Carregamento análise ETF internacional
 * @see ../../../casos-de-uso/ui/analise/internacional/01-carregamento-internacional.md
 */
test.describe('UI-ANL-014', () => {
  test.beforeEach(async ({ request }) => {
    await seedEtfIntlAnalysis(request);
  });

  test('carrega página internacional com VOO na carteira', async ({ page }) => {
    await gotoInternacionalPage(page);
    const section = etfIntlAnalysisTableSection(page);
    await expect(section).toBeVisible();
    await expect(section.getByRole('columnheader', { name: '% desejado' })).toBeVisible();
    await expect(section.locator('tbody tr')).toContainText('VOO');
    await expect(section.getByText('Total % desejado')).toBeVisible();
    await expect(page.getByRole('combobox', { name: 'Selecionar carteira' })).not.toHaveValue('');
  });
});
