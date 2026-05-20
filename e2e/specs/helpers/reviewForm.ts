import { expect, type Locator } from '@playwright/test';

import { BBSE3_FAKE_LOOKUP, BBSE3_UI_LABELS, TICKER_BBSE3 } from './bbse3Fixtures';

export async function expectReviewFormExactBbse3(reviewForm: Locator): Promise<void> {
  await expect(reviewForm.getByRole('textbox', { name: 'Ticker', exact: true })).toHaveValue(
    BBSE3_FAKE_LOOKUP.symbol
  );
  await expect(reviewForm.getByRole('textbox', { name: 'Nome', exact: true })).toHaveValue(
    BBSE3_FAKE_LOOKUP.name
  );
  await expect(reviewForm.getByRole('combobox', { name: 'Tipo' })).toHaveValue(
    BBSE3_FAKE_LOOKUP.asset_type
  );
  await expect(reviewForm.getByRole('combobox', { name: 'Mercado' })).toHaveValue(
    BBSE3_FAKE_LOOKUP.market
  );
  await expect(reviewForm.getByRole('combobox', { name: 'País' })).toHaveValue(BBSE3_FAKE_LOOKUP.country);
  await expect(reviewForm.getByRole('combobox', { name: 'Moeda' })).toHaveValue(BBSE3_FAKE_LOOKUP.currency);
  await expect(reviewForm.getByRole('textbox', { name: 'Setor', exact: true })).toHaveValue(
    BBSE3_FAKE_LOOKUP.sector
  );

  await expect(reviewForm.getByRole('combobox', { name: 'Tipo' })).toContainText(BBSE3_UI_LABELS.tipo);
  await expect(reviewForm.getByRole('combobox', { name: 'Mercado' })).toContainText(
    BBSE3_UI_LABELS.mercado
  );
  await expect(reviewForm.getByRole('combobox', { name: 'País' })).toContainText(BBSE3_UI_LABELS.pais);
  await expect(reviewForm.getByRole('combobox', { name: 'Moeda' })).toContainText(BBSE3_UI_LABELS.moeda);
}

export async function expectReviewFormYfinanceBbse3(reviewForm: Locator): Promise<void> {
  await expect(reviewForm.getByRole('textbox', { name: 'Ticker', exact: true })).toHaveValue(TICKER_BBSE3);

  const name = reviewForm.getByRole('textbox', { name: 'Nome', exact: true });
  const nameValue = await name.inputValue();
  expect(nameValue.trim().length).toBeGreaterThan(0);
  expect(/BB|Seguridade/i.test(nameValue)).toBeTruthy();

  await expect(reviewForm.getByRole('combobox', { name: 'Tipo' })).toHaveValue('stock');
  await expect(reviewForm.getByRole('combobox', { name: 'Tipo' })).toContainText(BBSE3_UI_LABELS.tipo);

  await expect(reviewForm.getByRole('combobox', { name: 'Mercado' })).toHaveValue('national');
  await expect(reviewForm.getByRole('combobox', { name: 'Mercado' })).toContainText(
    BBSE3_UI_LABELS.mercado
  );

  await expect(reviewForm.getByRole('combobox', { name: 'País' })).toHaveValue('BR');
  await expect(reviewForm.getByRole('combobox', { name: 'País' })).toContainText(/Brasil/i);

  await expect(reviewForm.getByRole('combobox', { name: 'Moeda' })).toHaveValue('BRL');
  await expect(reviewForm.getByRole('combobox', { name: 'Moeda' })).toContainText(BBSE3_UI_LABELS.moeda);

  const sector = await reviewForm.getByRole('textbox', { name: 'Setor', exact: true }).inputValue();
  expect(sector.trim().length).toBeGreaterThan(0);
}

export async function expectRegisteredAssetRowExact(table: Locator): Promise<void> {
  const row = table.locator('tbody tr').filter({ hasText: TICKER_BBSE3 });
  await expect(row).toHaveCount(1);

  const cells = row.getByRole('cell');
  await expect(cells.nth(0)).toHaveText(BBSE3_FAKE_LOOKUP.symbol);
  await expect(cells.nth(1)).toHaveText(BBSE3_FAKE_LOOKUP.name);
  await expect(cells.nth(2)).toHaveText(BBSE3_UI_LABELS.tipo);
  await expect(cells.nth(3)).toHaveText(BBSE3_UI_LABELS.classe);
  await expect(cells.nth(4)).toHaveText(BBSE3_UI_LABELS.moeda);
}

export async function expectRegisteredAssetRowYfinance(table: Locator): Promise<void> {
  const row = table.locator('tbody tr').filter({ hasText: TICKER_BBSE3 });
  await expect(row).toHaveCount(1);

  const cells = row.getByRole('cell');
  await expect(cells.nth(0)).toHaveText(TICKER_BBSE3);

  const nameText = (await cells.nth(1).innerText()).trim();
  expect(nameText.length).toBeGreaterThan(0);
  expect(/BB|Seguridade/i.test(nameText)).toBeTruthy();

  await expect(cells.nth(2)).toHaveText(BBSE3_UI_LABELS.tipo);
  await expect(cells.nth(3)).toHaveText(BBSE3_UI_LABELS.classe);
  await expect(cells.nth(4)).toHaveText(BBSE3_UI_LABELS.moeda);
}
