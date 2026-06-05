import { expect, test } from '../fixtures/test';


import {
  clickExportPortfolioJson,
  gotoDadosPage,
  readDownloadJson
} from '../helpers/dataPage';
import { E2E_PORTFOLIO_PRINCIPAL, TICKER_BBSE3 } from '../helpers/e2eFixtures';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';
import { seedDadosPortfolioExportWithDividend } from '../helpers/seedDados';

/**
 * UI-DAD-002 — Exportar carteira ativa JSON v2 com proventos
 * @see ../../../casos-de-uso/ui/dados/02-exportar-carteira-json-v2.md
 */
test.describe('UI-DAD-002', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedDadosPortfolioExportWithDividend(request);
  });

  test('baixa JSON v2 com posições e dividend_payments', async ({ page }) => {
    await gotoDadosPage(page);
    await expect(page.getByLabel('Selecionar carteira')).toContainText(E2E_PORTFOLIO_PRINCIPAL);

    const download = await clickExportPortfolioJson(page);
    expect(download.suggestedFilename()).toMatch(/\.carteira\.json$/);

    const json = (await readDownloadJson(download)) as {
      version: number;
      portfolio: unknown;
      assets: unknown[];
      positions: unknown[];
      dividend_payments: { symbol: string; amount: number }[];
    };
    expect(json.version).toBe(2);
    expect(json.portfolio).toBeDefined();
    expect(Array.isArray(json.assets)).toBe(true);
    expect(json.positions.some((p) => JSON.stringify(p).includes(TICKER_BBSE3))).toBe(true);
    expect(json.dividend_payments.length).toBeGreaterThanOrEqual(1);
    expect(
      json.dividend_payments.some(
        (d) => d.symbol.replace(/\.SA$/i, '') === TICKER_BBSE3
      )
    ).toBe(true);
  });
});
