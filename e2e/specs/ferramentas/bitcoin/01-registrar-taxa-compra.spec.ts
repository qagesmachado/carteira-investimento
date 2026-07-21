import { expect, test } from '../../fixtures/test';


import {
  expectCryptoFeeListed,
  expectTotalFeesVisible,
  fillCryptoFeeForm,
  gotoBitcoinPage,
  submitCryptoFeeForm
} from '../../helpers/bitcoinPage';
import { seedBitcoinPortfolio } from '../../helpers/seedBitcoin';

/**
 * UI-BTC-001 — Registrar taxa de compra BTC
 * @see ../../../casos-de-uso/ui/taxas-cripto/01-registrar-taxa-compra.md
 */
test.describe('UI-BTC-001', () => {
  test.beforeEach(async ({ request }) => {
    await seedBitcoinPortfolio(request);
  });

  test('registra taxa de compra e exibe total no resumo', async ({ page }) => {
    await gotoBitcoinPage(page);
    await expectTotalFeesVisible(page);
    await expect(page.locator('.stat-desc', { hasText: 'BTC-USD' })).toBeVisible();

    await fillCryptoFeeForm(page, {
      typeLabel: 'Taxa de compra',
      date: '26/06/2025',
      quantityMoved: '0.00084',
      feeQuantity: '0.00000084',
      quoteBrl: '590867',
      fxRate: '5,54'
    });
    await submitCryptoFeeForm(page);

    await expectCryptoFeeListed(page, 'Compra');
    await expect(page.getByTestId('crypto-fee-list').getByRole('columnheader', { name: /Cot R\$/ })).toBeVisible();
    await expect(page.getByTestId('crypto-fee-list').getByRole('columnheader', { name: /Cot US\$/ })).toBeVisible();
    await expect(page.getByText('Total taxas pagas').locator('..').getByText(/R\$/)).toBeVisible();
  });
});
