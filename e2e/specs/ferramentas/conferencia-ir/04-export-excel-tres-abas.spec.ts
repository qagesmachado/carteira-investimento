import { expect, test } from '../../fixtures/test';

import {
  clickExportIrExcel,
  freezeIrSnapshot,
  gotoConferenciaIrPage,
  readDownloadXlsxSheetNames,
  selectIrYear
} from '../../helpers/conferenciaIrPage';
import { seedConferenciaIrBase } from '../../helpers/seedConferenciaIr';

/**
 * UI-IR-004 — Export Excel com três abas
 * @see ../../../../casos-de-uso/ui/ferramentas/conferencia-ir/04-export-excel-tres-abas.md
 */
test.describe('UI-IR-004', () => {
  test.beforeEach(async ({ request }) => {
    await seedConferenciaIrBase(request);
  });

  test('download Excel contém abas Detalhado, Resumo e Posições', async ({ page }) => {
    await gotoConferenciaIrPage(page);
    await selectIrYear(page, 2024);
    await freezeIrSnapshot(page);

    const download = await clickExportIrExcel(page);
    expect(download.suggestedFilename()).toMatch(/conferencia-ir-.*-2024\.xlsx$/);

    const sheetNames = await readDownloadXlsxSheetNames(download);
    expect(sheetNames).toEqual(['Detalhado', 'Resumo', 'Posições']);
  });
});
