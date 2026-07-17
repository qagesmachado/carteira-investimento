import { expect, test } from '../../fixtures/test';


import { gotoRebalancePage } from '../../helpers/rebalancePage';
import {
  saveEtfIntlAllocationViaApi,
  seedEtfIntlAnalysis
} from '../../helpers/seedEtfIntlAnalysis';
import { getWorkerApiBaseUrl } from '../../helpers/workerContext';

/**
 * UI-ANL-016 — Rebalanceamento reflete alocação internacional
 * @see ../../../casos-de-uso/ui/analise/internacional/03-rebalance-reflete-alocacao.md
 */
test.describe('UI-ANL-016', () => {
  test('aba ETF internacional exibe % desejada após alocação', async ({ page, request }) => {
    const portfolioId = await seedEtfIntlAnalysis(request);
    const assets = await request.get(`${getWorkerApiBaseUrl()}/assets`);
    const voo = ((await assets.json()) as { id: number; symbol: string }[]).find(
      (a) => a.symbol === 'VOO'
    );
    if (!voo) throw new Error('VOO not found');
    await saveEtfIntlAllocationViaApi(request, portfolioId, voo.id);

    await gotoRebalancePage(page);
    const section = page.locator('section').filter({ hasText: 'Por ativo' });
    await section.getByRole('tab', { name: 'ETF internacional' }).click();
    const row = section.locator('table tbody tr').filter({ hasText: 'VOO' }).first();
    const targetCell = row.locator('td').nth(4);
    await expect(targetCell).toContainText('100');
    await expect(targetCell).not.toHaveText('—');
    const valueCell = row.locator('td').nth(2);
    await expect(valueCell).toContainText(/US\$|\$/);
    await expect(valueCell.locator('[aria-label*="equivalente"]')).toBeVisible();
  });
});
