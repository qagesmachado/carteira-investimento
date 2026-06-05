import { expect, test } from '../fixtures/test';


import {
  DIVIDEND_CSV_LEGACY,
  DIVIDEND_CSV_TEMPLATE,
  expectPreviewRowStatus,
  importSelectedDividends,
  pasteDividendCsvAndAnalyze,
  previewDividendBulkOnServer
} from '../helpers/dividendBulkImport';
import { TICKER_ITSA4 } from '../helpers/e2eFixtures';
import { gotoDadosPage } from '../helpers/dataPage';
import { expectPaymentRow, gotoProventosPage } from '../helpers/proventosPage';
import { seedProventosWithItsa4 } from '../helpers/seedProventos';

/**
 * UI-PRV-014 — Importação em lote CSV/Excel
 * @see ../../../casos-de-uso/ui/proventos/14-importacao-lote.md
 */
test.describe('UI-PRV-014', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosWithItsa4(request);
  });

  test('importa proventos via CSV template', async ({ page }) => {
    await gotoDadosPage(page);

    await pasteDividendCsvAndAnalyze(page, DIVIDEND_CSV_TEMPLATE);
    await expect(page.getByText(/linha\(s\) válida\(s\)/)).toBeVisible();
    await expect(page.getByText(/linha\(s\) válida\(s\) \(template\)/)).toBeVisible();

    await previewDividendBulkOnServer(page);
    await expectPreviewRowStatus(page, TICKER_ITSA4, 'Pronto');
    await importSelectedDividends(page);

    await expect(page.getByText(/Importação em lote concluída|Importação concluída/)).toBeVisible();

    await gotoProventosPage(page);
    await expectPaymentRow(page, TICKER_ITSA4, { typeLabel: 'Dividendo' });
  });

  test('importa proventos via CSV legado', async ({ page }) => {
    await gotoDadosPage(page);

    await pasteDividendCsvAndAnalyze(page, DIVIDEND_CSV_LEGACY);
    await expect(page.getByText(/linha\(s\) válida\(s\) \(legacy\)/)).toBeVisible();

    await previewDividendBulkOnServer(page);
    await expectPreviewRowStatus(page, TICKER_ITSA4, 'Pronto');
    await importSelectedDividends(page);

    await gotoProventosPage(page);
    await expectPaymentRow(page, TICKER_ITSA4, { typeLabel: 'Dividendo' });
  });
});
