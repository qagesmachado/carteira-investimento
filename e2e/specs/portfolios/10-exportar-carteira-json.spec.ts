import { expect, test } from '../fixtures/test';


import {
  clickExportPortfolioJson,
  gotoDadosPage,
  readDownloadJson
} from '../helpers/dataPage';
import { seedPortfoliosFullMix } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-010 — Exportar carteira JSON (legado → /dados)
 * @see ../../../casos-de-uso/ui/portfolios/10-exportar-carteira-json.md
 */
test.describe('UI-PRT-010', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosFullMix(request);
  });

  test('baixa arquivo .carteira.json válido em /dados', async ({ page }) => {
    await gotoDadosPage(page);
    const download = await clickExportPortfolioJson(page);
    expect(download.suggestedFilename()).toMatch(/\.carteira\.json$/);

    const json = (await readDownloadJson(download)) as {
      version: unknown;
      portfolio: unknown;
      positions: unknown[];
    };
    expect(json.version).toBeDefined();
    expect(json.portfolio).toBeDefined();
    expect(Array.isArray(json.positions)).toBe(true);
  });
});
