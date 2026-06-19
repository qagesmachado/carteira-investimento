import { expect, type Locator, type Page } from '@playwright/test';

import { addAssetModal, openAddAssetModal, selectAddKind } from './portfoliosPage';

const SYMBOL_PLACEHOLDER = 'Ex.: CDB BTG IPCA+ 2028';
const NAME_PLACEHOLDER = 'Ex.: CDB Banco BTG — IPCA + 8,40% a.a.';

export function fixedIncomeEditModal(page: Page): Locator {
  return page
    .locator('.modal-box')
    .filter({ has: page.getByRole('heading', { name: 'Editar ativo na carteira' }) });
}

async function fillModalBrDecimal(
  scope: Locator,
  label: string | RegExp,
  value: string
): Promise<void> {
  const input = scope.getByRole('textbox', { name: label });
  await input.click();
  await input.fill(value);
  await input.blur();
}

/** Cadastra renda fixa pelo modal unificado (produto + valores numa ação). */
export async function addFixedIncomeViaModal(
  page: Page,
  opts: {
    symbol: string;
    name: string;
    indexer?: 'prefixed' | 'ipca_plus' | 'post_fixed';
    yieldText?: string;
    invested: string;
    current: string;
  }
): Promise<void> {
  await openAddAssetModal(page);
  await selectAddKind(page, 'Renda fixa');
  const modal = addAssetModal(page);

  await modal.getByPlaceholder(SYMBOL_PLACEHOLDER).fill(opts.symbol);
  await modal.getByPlaceholder(NAME_PLACEHOLDER).fill(opts.name);
  if (opts.indexer) {
    await modal.getByLabel('Indexador').selectOption(opts.indexer);
  }
  if (opts.yieldText) {
    await modal.getByLabel('Rentabilidade').fill(opts.yieldText);
  }
  await fillModalBrDecimal(modal, /Valor aplicado/, opts.invested);
  await fillModalBrDecimal(modal, /Valor atual/, opts.current);

  const createResponse = page.waitForResponse(
    (r) =>
      r.request().method() === 'POST' &&
      r.url().includes('/fixed-income-positions') &&
      r.ok()
  );
  await modal.getByRole('button', { name: 'Salvar na carteira' }).click();
  await createResponse;
}

/** Cadastra previdência pelo modal unificado (produto + valores numa ação). */
export async function addPensionViaModal(
  page: Page,
  opts: { symbol: string; name: string; invested: string; current: string }
): Promise<void> {
  await openAddAssetModal(page);
  await selectAddKind(page, 'Previdência');
  const modal = addAssetModal(page);

  await modal.getByPlaceholder(SYMBOL_PLACEHOLDER).fill(opts.symbol);
  await modal.getByPlaceholder(NAME_PLACEHOLDER).fill(opts.name);
  await fillModalBrDecimal(modal, /Valor aplicado/, opts.invested);
  await fillModalBrDecimal(modal, /Valor atual/, opts.current);

  const createResponse = page.waitForResponse(
    (r) =>
      r.request().method() === 'POST' &&
      r.url().includes('/fixed-income-positions') &&
      r.ok()
  );
  await modal.getByRole('button', { name: 'Salvar na carteira' }).click();
  await createResponse;
}

/** Tenta salvar a aba Renda fixa sem preencher campos obrigatórios. */
export async function submitFixedIncomeModalEmpty(page: Page): Promise<void> {
  await openAddAssetModal(page);
  await selectAddKind(page, 'Renda fixa');
  await addAssetModal(page).getByRole('button', { name: 'Salvar na carteira' }).click();
}

/** Edita valores de uma renda fixa/previdência já na carteira. */
export async function saveFixedIncomeEdit(
  page: Page,
  opts: { invested?: string; current?: string }
): Promise<void> {
  const modal = fixedIncomeEditModal(page);
  await expect(modal).toBeVisible();
  if (opts.invested) {
    await fillModalBrDecimal(modal, /Valor aplicado/, opts.invested);
  }
  if (opts.current) {
    await fillModalBrDecimal(modal, /Valor atual/, opts.current);
  }
  const patchResponse = page.waitForResponse(
    (r) =>
      r.request().method() === 'PATCH' && r.url().includes('/fixed-income') && r.ok()
  );
  await modal.getByRole('button', { name: 'Salvar alterações' }).click();
  await patchResponse;
}
