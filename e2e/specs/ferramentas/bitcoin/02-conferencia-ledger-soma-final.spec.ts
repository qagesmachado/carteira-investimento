import { expect, test } from '../../fixtures/test';


import { gotoBitcoinPage } from '../../helpers/bitcoinPage';
import { seedBitcoinPortfolioWithTransfer } from '../../helpers/seedBitcoinTransfer';

/**
 * UI-BTC-002 — Conferência Ledger (soma Final BTC)
 * @see ../../../casos-de-uso/ui/ferramentas/bitcoin/02-conferencia-ledger-soma-final.md
 */
test.describe('UI-BTC-002', () => {
  test.beforeEach(async ({ request }) => {
    await seedBitcoinPortfolioWithTransfer(request);
  });

  test('exibe soma Final BTC das transferências Ledger no resumo', async ({ page }) => {
    await gotoBitcoinPage(page);
    const card = page.getByTestId('bitcoin-transfer-ledger-total');
    await expect(card.getByText('Conferência Ledger')).toBeVisible();
    await expect(card).toContainText('0,00080916');
    await expect(card).toContainText('1 transferência');
  });
});
