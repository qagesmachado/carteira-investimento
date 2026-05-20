import { expect, type Page } from '@playwright/test';

import {
  E2E_CDB_NAME,
  E2E_PENSION_IDENTIFIER,
  E2E_PENSION_NAME
} from './e2eFixtures';
import { reviewForm, SAVE_SUCCESS_MESSAGE } from './assetsPage';

export async function startManualFixedIncome(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Nova renda fixa' }).click();
  await expect(page.getByText('Cadastro manual de renda fixa')).toBeVisible();
}

export async function startManualPension(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Nova previdência' }).click();
  await expect(page.getByText('Cadastro manual de previdência')).toBeVisible();
}

export async function fillAndSaveManualFixedIncome(page: Page): Promise<void> {
  const form = reviewForm(page);

  await form.getByLabel('Indexador').selectOption('ipca_plus');
  await form.getByLabel('Rentabilidade').fill('IPCA + 8,4% a.a.');
  const maturity = form.getByLabel('Data de vencimento');
  await maturity.fill('31/12/2028');
  await maturity.blur();
  const purchase = form.getByLabel('Data de compra');
  await purchase.fill('15/01/2024');
  await purchase.blur();

  await form.getByRole('button', { name: 'Identificador' }).click();
  const identifierInput = form.getByPlaceholder('Ex.: CDB BTG IPCA+ 2028');
  await expect(identifierInput).not.toHaveValue('');

  await form.getByLabel('Descrição do produto').fill(E2E_CDB_NAME);

  const createResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/assets') &&
      !response.url().includes('/bulk') &&
      response.ok()
  );
  await form.getByRole('button', { name: 'Salvar ativo' }).click();
  await createResponse;

  await expect(page.getByRole('alert').filter({ hasText: SAVE_SUCCESS_MESSAGE })).toBeVisible();
}

export async function fillAndSaveManualPension(page: Page): Promise<void> {
  const form = reviewForm(page);

  await form.getByLabel('Identificador').fill(E2E_PENSION_IDENTIFIER);
  await form.getByLabel('Descrição do produto').fill(E2E_PENSION_NAME);

  const createResponse = page.waitForResponse(
    (response) =>
      response.request().method() === 'POST' &&
      response.url().includes('/assets') &&
      !response.url().includes('/bulk') &&
      response.ok()
  );
  await form.getByRole('button', { name: 'Salvar ativo' }).click();
  await createResponse;

  await expect(page.getByRole('alert').filter({ hasText: SAVE_SUCCESS_MESSAGE })).toBeVisible();
}

export async function submitManualFixedIncomeEmpty(page: Page): Promise<void> {
  await startManualFixedIncome(page);
  const form = reviewForm(page);
  await form.getByRole('button', { name: 'Salvar ativo' }).click();
}
