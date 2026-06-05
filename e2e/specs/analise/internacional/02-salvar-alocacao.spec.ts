import { expect, test } from '../../fixtures/test';


import {
  etfIntlAnalysisRow,
  gotoInternacionalPage,
  saveEtfIntlAllocation
} from '../../helpers/analisePage';
import { seedEtfIntlAnalysis } from '../../helpers/seedEtfIntlAnalysis';

/**
 * UI-ANL-015 — Salvar alocação ETF internacional
 * @see ../../../casos-de-uso/ui/analise/internacional/02-salvar-alocacao.md
 */
test.describe('UI-ANL-015', () => {
  test.beforeEach(async ({ request }) => {
    await seedEtfIntlAnalysis(request);
  });

  test('define % e link e salva alocação com soma 100%', async ({ page }) => {
    await gotoInternacionalPage(page);
    const row = etfIntlAnalysisRow(page, 'VOO');
    await row.locator('input[type="text"]').first().fill('100');
    await row.locator('input[type="text"]').first().blur();
    await row.locator('input[type="url"]').fill('https://example.com/voo');
    await saveEtfIntlAllocation(page);
    await expect(page.getByText('100,00%').first()).toBeVisible();
  });
});
