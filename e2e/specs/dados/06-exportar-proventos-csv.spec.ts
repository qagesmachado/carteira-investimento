import { expect, test } from '../fixtures/test';


import {
  clickExportDividendsCsv,
  gotoDadosPage,
  readDownloadText,
  selectDividendsExportPortfolio
} from '../helpers/dataPage';
import { seedProventosSeparacaoPorCarteira } from '../helpers/seedProventos';

/**
 * UI-DAD-006 — Exportar proventos filtrados por carteira (CSV)
 * @see ../../../casos-de-uso/ui/dados/06-exportar-proventos-csv.md
 */
test.describe('UI-DAD-006', () => {
  test.beforeEach(async ({ request }) => {
    await seedProventosSeparacaoPorCarteira(request);
  });

  test('CSV contém apenas proventos da carteira selecionada', async ({ page }) => {
    await gotoDadosPage(page);

    await selectDividendsExportPortfolio(page, 'Carteira A');
    const downloadA = await clickExportDividendsCsv(page);
    const csvA = await readDownloadText(downloadA);
    expect(csvA).toMatch(/50[,.]0|50\.0/);
    expect(csvA).not.toMatch(/,12[,.]0|,12\.0/);

    await selectDividendsExportPortfolio(page, 'Carteira B');
    const downloadB = await clickExportDividendsCsv(page);
    const csvB = await readDownloadText(downloadB);
    expect(csvB).toMatch(/,12[,.]0|,12\.0/);
    expect(csvB).not.toMatch(/,50[,.]0|,50\.0/);
  });
});
