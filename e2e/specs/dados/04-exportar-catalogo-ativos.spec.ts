import { expect, test } from '../fixtures/test';


import {
  clickExportAssetsCatalog,
  gotoDadosPage,
  readDownloadJson
} from '../helpers/dataPage';
import { TICKER_BBSE3, TICKER_ITSA4 } from '../helpers/e2eFixtures';
import { seedDadosTwoCatalogAssets } from '../helpers/seedDados';

/**
 * UI-DAD-004 — Exportar catálogo de ativos JSON
 * @see ../../../casos-de-uso/ui/dados/04-exportar-catalogo-ativos.md
 */
test.describe('UI-DAD-004', () => {
  test.beforeEach(async ({ request }) => {
    await seedDadosTwoCatalogAssets(request);
  });

  test('baixa catálogo com ativos seed', async ({ page }) => {
    await gotoDadosPage(page);
    const download = await clickExportAssetsCatalog(page);
    expect(download.suggestedFilename()).toMatch(/\.json$/);

    const json = (await readDownloadJson(download)) as {
      version: number;
      assets: { symbol: string; asset_type: string; market: string }[];
    };
    expect(json.version).toBeDefined();
    expect(json.assets.length).toBeGreaterThanOrEqual(2);
    const symbols = json.assets.map((a) => a.symbol);
    expect(symbols).toContain(TICKER_BBSE3);
    expect(symbols).toContain(TICKER_ITSA4);
    expect(json.assets.every((a) => a.asset_type && a.market)).toBe(true);
  });
});
