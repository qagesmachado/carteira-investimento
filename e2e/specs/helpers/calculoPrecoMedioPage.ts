import { expect, type Page } from '@playwright/test';

import { pickAssetViaTrigger } from './assetPicker';

async function fillBrDecimalTestInput(page: Page, testId: string, value: string): Promise<void> {
  const input = page.getByTestId(testId);
  await input.click();
  await input.fill(value);
  await input.dispatchEvent('input');
  await input.blur();
}

export async function gotoCalculoPrecoMedioPage(page: Page): Promise<void> {
  await page.goto('/ferramentas/calculo-preco-medio');
  await expect(page.getByRole('heading', { name: 'Cálculo de preço médio' })).toBeVisible();
  await expect(page.getByTestId('average-price-calculator')).toBeVisible();
}

export async function selectManualTab(page: Page): Promise<void> {
  await page.getByTestId('tab-manual').click();
  await expect(page.getByTestId('manual-lots-form')).toBeVisible();
}

export async function selectPortfolioTab(page: Page): Promise<void> {
  await page.getByTestId('tab-portfolio').click();
  await expect(page.getByTestId('portfolio-lot-form')).toBeVisible();
}

export async function fillManualLots(
  page: Page,
  options: {
    lot1Quantity: string;
    lot1Price: string;
    lot2Quantity: string;
    lot2Price: string;
  }
): Promise<void> {
  await fillBrDecimalTestInput(page, 'manual-lot1-quantity', options.lot1Quantity);
  await fillBrDecimalTestInput(page, 'manual-lot1-price', options.lot1Price);
  await fillBrDecimalTestInput(page, 'manual-lot2-quantity', options.lot2Quantity);
  await fillBrDecimalTestInput(page, 'manual-lot2-price', options.lot2Price);
}

export async function selectPortfolioPosition(page: Page, ticker: string): Promise<void> {
  await pickAssetViaTrigger(page, page.getByTestId('portfolio-position-select'), ticker);
}

export async function fillPortfolioLot2(
  page: Page,
  options: { quantity: string; price: string }
): Promise<void> {
  await fillBrDecimalTestInput(page, 'portfolio-lot2-quantity', options.quantity);
  await fillBrDecimalTestInput(page, 'portfolio-lot2-price', options.price);
}

export async function expectAveragePriceResult(
  page: Page,
  options: { totalQuantity: RegExp | string; averagePrice: RegExp | string }
): Promise<void> {
  await expect(page.getByTestId('result-total-quantity')).toContainText(options.totalQuantity);
  await expect(page.getByTestId('result-average-price')).toContainText(options.averagePrice);
}
