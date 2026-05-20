import { expect, test } from '@playwright/test';

import { clickExportJson, gotoPortfoliosPage } from '../helpers/portfoliosPage';
import { seedPortfoliosFullMix } from '../helpers/seedPortfolios';
import { assertYfinanceLookupBackend } from '../helpers/lookupEnv';

/**
 * UI-PRT-010 — Exportar carteira JSON
 * @see ../../../casos-de-uso/ui/portfolios/10-exportar-carteira-json.md
 */
test.describe('UI-PRT-010', () => {
  test.beforeEach(async ({ request }) => {
    test.setTimeout(90_000);
    await assertYfinanceLookupBackend(request);
    await seedPortfoliosFullMix(request);
  });

  test('baixa arquivo .carteira.json válido', async ({ page }) => {
    await gotoPortfoliosPage(page);
    const download = await clickExportJson(page);
    expect(download.suggestedFilename()).toMatch(/\.carteira\.json$/);

    const path = await download.path();
    expect(path).toBeTruthy();
    const body = await download.createReadStream();
    const chunks: Buffer[] = [];
    for await (const chunk of body!) {
      chunks.push(Buffer.from(chunk));
    }
    const json = JSON.parse(Buffer.concat(chunks).toString('utf8'));
    expect(json.version).toBeDefined();
    expect(json.portfolio).toBeDefined();
    expect(Array.isArray(json.positions)).toBe(true);
  });
});
