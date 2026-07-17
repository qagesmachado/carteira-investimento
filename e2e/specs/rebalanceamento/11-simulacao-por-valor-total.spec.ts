import { expect, test } from '../fixtures/test';

import {
  balanceamentoTableSection,
  fillFinalPatrimonyAmount,
  gotoRebalancePage,
  simulationPanel
} from '../helpers/rebalancePage';
import { seedRebalanceWithMix } from '../helpers/seedRebalance';

/**
 * UI-REB-011 — Simulação por patrimônio final desejado
 * @see ../../../casos-de-uso/ui/rebalanceamento/11-simulacao-por-valor-total.md
 */
test.describe('UI-REB-011', () => {
  test.beforeEach(async ({ request }) => {
    await seedRebalanceWithMix(request);
  });

  test('calcula aporte a partir do patrimônio final desejado', async ({ page }) => {
    await gotoRebalancePage(page);

    const patrimonyText = await page.getByTestId('rebalance-kpi-patrimony').innerText();
    const patrimonyMatch = patrimonyText.match(/R\$\s*([\d.]+,\d{2})/);
    expect(patrimonyMatch).not.toBeNull();
    const patrimony = Number.parseFloat(
      patrimonyMatch![1].replace(/\./g, '').replace(',', '.')
    );
    const finalTotal = patrimony + 10_000;

    await fillFinalPatrimonyAmount(page, String(finalTotal));

    const panel = simulationPanel(page);
    await expect(panel.getByTestId('rebalance-simulation-resolved-investment')).toContainText(
      '10.000'
    );
    await expect(panel.getByTestId('rebalance-simulation-final-patrimony')).toBeVisible();

    const table = balanceamentoTableSection(page);
    const intlRow = table.getByRole('row').filter({ hasText: 'Internacional' });
    await expect(intlRow.locator('td').nth(9)).not.toHaveText('—');
    await expect(intlRow.locator('td').nth(10)).not.toHaveText('—');
  });
});
