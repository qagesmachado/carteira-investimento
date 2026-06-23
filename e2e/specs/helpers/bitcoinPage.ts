import { expect, type Page } from '@playwright/test';

export async function gotoBitcoinPage(page: Page): Promise<void> {
  await page.goto('/ferramentas/criptomoedas');
  await expect(page.getByRole('heading', { name: 'Criptomoedas', level: 2 })).toBeVisible();
}

export async function gotoCriptomoedasToolsPage(page: Page): Promise<void> {
  await gotoBitcoinPage(page);
}

export async function fillCryptoFeeForm(
  page: Page,
  options: {
    typeLabel?: string;
    date: string;
    quantityMoved: string;
    feeQuantity: string;
    quoteBrl: string;
    fxRate: string;
  }
): Promise<void> {
  if (options.typeLabel) {
    await page.getByTestId('crypto-fee-type').selectOption({ label: options.typeLabel });
  }
  await page.getByTestId('crypto-fee-date').fill(options.date);
  await page.getByTestId('crypto-fee-quantity-moved').fill(options.quantityMoved.replace('.', ','));
  await page.getByTestId('crypto-fee-quantity-fee').fill(options.feeQuantity.replace('.', ','));
  await page.getByTestId('crypto-fee-quote-brl').fill(options.quoteBrl);
  await page.getByTestId('crypto-fee-fx-rate').fill(options.fxRate);
}

export async function submitCryptoFeeForm(page: Page): Promise<void> {
  await page.getByTestId('crypto-fee-submit').click();
}

export async function expectCryptoFeeListed(page: Page, typeLabel: string): Promise<void> {
  await expect(
    page.getByTestId('crypto-fee-list').locator('tbody').getByText(typeLabel)
  ).toBeVisible();
}

export async function expectTotalFeesVisible(page: Page): Promise<void> {
  await expect(page.getByText('Total taxas pagas')).toBeVisible();
}

export async function expectTransferLedgerTotal(
  page: Page,
  quantityText: string
): Promise<void> {
  const card = page.getByTestId('bitcoin-transfer-ledger-total');
  await expect(card).toContainText(quantityText);
}
