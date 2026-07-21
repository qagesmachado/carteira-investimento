import { expect, test } from '../../fixtures/test';

import {
  clickIrTab,
  freezeIrSnapshot,
  gotoConferenciaIrPage,
  selectIrYear
} from '../../helpers/conferenciaIrPage';
import { seedConferenciaIrBase } from '../../helpers/seedConferenciaIr';
import { getWorkerApiBaseUrl } from '../../helpers/workerContext';
import { getAssetIdBySymbol } from '../../helpers/testPortfolios';
import { TICKER_BBSE3 } from '../../helpers/e2eFixtures';

/**
 * UI-IR-003 — Snapshot congela posições em 31/12
 * @see ../../../../casos-de-uso/ui/conferencia-ir/03-snapshot-congela-posicoes.md
 */
test.describe('UI-IR-003', () => {
  test.beforeEach(async ({ request }) => {
    await seedConferenciaIrBase(request);
  });

  test('snapshot preserva qty e preço médio na aba Posições', async ({ page, request }) => {
    await gotoConferenciaIrPage(page);
    await selectIrYear(page, 2024);
    await freezeIrSnapshot(page);
    await clickIrTab(page, 'posicoes');

    const table = page.getByTestId('ir-table-posicoes');
    const row = table.locator('tbody tr').filter({ hasText: 'BBSE3' });
    await expect(row).toContainText('100');
    await expect(row).toContainText('32,5');
    await expect(row).toContainText('3.250,00');

    const portfolios = await request.get(`${getWorkerApiBaseUrl()}/portfolios`);
    const portfolioList = (await portfolios.json()) as { id: number }[];
    const portfolioId = portfolioList[0]?.id;
    const assetId = await getAssetIdBySymbol(request, TICKER_BBSE3);
    const positions = await request.get(`${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/positions`);
    const positionBody = (await positions.json()) as { id: number }[];
    await request.patch(
      `${getWorkerApiBaseUrl()}/portfolios/${portfolioId}/positions/${positionBody[0].id}`,
      { data: { quantity: 5, average_price: 9 } }
    );

    await page.reload();
    await selectIrYear(page, 2024);
    await clickIrTab(page, 'posicoes');
    await expect(row).toContainText('100');
    await expect(row).toContainText('32,5');
    await expect(row).toContainText('3.250,00');
  });
});
