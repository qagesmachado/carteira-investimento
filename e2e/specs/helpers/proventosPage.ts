import { expect, type Locator, type Page } from '@playwright/test';

import { pickAssetViaTrigger } from './assetPicker';
import {
  isApiAssetsListResponse,
  isApiDividendPaymentDeleteResponse,
  isApiDividendPaymentPatchResponse,
  isApiDividendPaymentPostResponse,
  isApiDividendPaymentsListResponse
} from './apiResponses';

/** Abre a aba «Adicionar» (formulário + importação em lote). */
export async function gotoProventosPage(page: Page): Promise<void> {
  const assetsResponse = page.waitForResponse(
    (r) => isApiAssetsListResponse(r, 'GET') && r.ok()
  );
  const dividendsResponse = page.waitForResponse(
    (r) => isApiDividendPaymentsListResponse(r, 'GET') && r.ok()
  );
  await page.goto('/proventos/adicionar');
  await assetsResponse;
  await dividendsResponse;
  await expect(proventoFormSection(page)).toBeVisible();
}

/** Abre a aba «Resumo» (KPIs, gráfico e top ativos). */
export async function gotoProventosSummaryPage(page: Page): Promise<void> {
  const assetsResponse = page.waitForResponse(
    (r) => isApiAssetsListResponse(r, 'GET') && r.ok()
  );
  const dividendsResponse = page.waitForResponse(
    (r) => isApiDividendPaymentsListResponse(r, 'GET') && r.ok()
  );
  await page.goto('/proventos/resumo');
  await assetsResponse;
  await dividendsResponse;
  await expect(page.getByTestId('proventos-kpi-cards')).toBeVisible();
}

/** Abre a aba «Lançamentos» (lista de proventos). */
export async function gotoProventosListPage(page: Page): Promise<void> {
  const assetsResponse = page.waitForResponse(
    (r) => isApiAssetsListResponse(r, 'GET') && r.ok()
  );
  const dividendsResponse = page.waitForResponse(
    (r) => isApiDividendPaymentsListResponse(r, 'GET') && r.ok()
  );
  await page.goto('/proventos/lancamentos');
  await assetsResponse;
  await dividendsResponse;
  await expect(paymentsListSection(page)).toBeVisible();
}

/** Troca para a aba «Lançamentos» via pill (navegação client-side). */
export async function goToProventosListTab(page: Page): Promise<void> {
  await page.getByTestId('proventos-section-tab-lancamentos').click();
  await expect(paymentsListSection(page)).toBeVisible();
}

/**
 * Troca a carteira ativa da seção pelo painel no topo (após as abas).
 * Aguarda o recarregamento dos proventos do novo escopo.
 */
export async function selectProventosPortfolio(page: Page, name: string): Promise<void> {
  const listResponse = page.waitForResponse(
    (r) => isApiDividendPaymentsListResponse(r, 'GET') && r.ok()
  );
  await page.getByTestId('proventos-portfolio-select').selectOption({ label: name });
  await listResponse;
}

export function proventoFormSection(page: Page): Locator {
  return page.locator('form').filter({ has: page.getByRole('button', { name: 'Cadastrar provento' }) });
}

export function paymentsListSection(page: Page): Locator {
  return page.locator('section').filter({ has: page.getByRole('heading', { name: 'Proventos cadastrados' }) });
}

export function paymentsTable(page: Page): Locator {
  return paymentsListSection(page).locator('table.table tbody');
}

export async function pickAssetInProventoForm(page: Page, ticker: string): Promise<void> {
  const form = proventoFormSection(page);
  const picker = form.locator('.asset-picker');
  await pickAssetViaTrigger(page, picker.locator('button.input'), ticker);
}

export async function fillProventoForm(
  page: Page,
  options: {
    type?: string;
    dateBr?: string;
    amount?: string;
    taxWithheld?: string;
    currency?: string;
  } = {}
): Promise<void> {
  const form = proventoFormSection(page);
  if (options.type) {
    await form
      .locator('label')
      .filter({ has: page.locator('span', { hasText: 'Tipo de provento' }) })
      .locator('select')
      .selectOption({ label: options.type });
  }
  if (options.dateBr) {
    await form.getByPlaceholder('DD/MM/AAAA').fill(options.dateBr);
  }
  if (options.amount) {
    await form
      .locator('label')
      .filter({ has: page.locator('span', { hasText: 'Recebido' }) })
      .locator('input')
      .fill(options.amount);
  }
  if (options.taxWithheld) {
    await form
      .locator('label')
      .filter({ has: page.locator('span', { hasText: 'Imposto retido' }) })
      .locator('input')
      .fill(options.taxWithheld);
  }
  if (options.currency) {
    await form.getByLabel('Moeda').fill(options.currency);
  }
}

export async function submitProventoForm(page: Page): Promise<void> {
  const createResponse = page.waitForResponse(
    (r) => isApiDividendPaymentPostResponse(r) && r.ok()
  );
  await proventoFormSection(page).getByRole('button', { name: 'Cadastrar provento' }).click();
  await createResponse;
}

export async function submitProventoFormWithoutWait(page: Page): Promise<void> {
  await proventoFormSection(page).getByRole('button', { name: 'Cadastrar provento' }).click();
}

export async function expectPaymentRow(
  page: Page,
  ticker: string,
  options: { typeLabel?: string; amountPattern?: RegExp } = {}
): Promise<void> {
  const row = paymentsTable(page).locator('tr').filter({ hasText: ticker });
  await expect(row).toHaveCount(1);
  if (options.typeLabel) {
    await expect(row).toContainText(options.typeLabel);
  }
  if (options.amountPattern) {
    await expect(row).toContainText(options.amountPattern);
  }
}

export async function filterByTickerText(page: Page, text: string): Promise<void> {
  await paymentsListSection(page).getByPlaceholder('Ticker ou nome').fill(text);
  await page.waitForTimeout(250);
}

export async function filterByType(page: Page, label: string): Promise<void> {
  const listResponse = page.waitForResponse(
    (r) => isApiDividendPaymentsListResponse(r, 'GET') && r.ok()
  );
  await paymentsListSection(page)
    .locator('label')
    .filter({ has: page.locator('span.label-text', { hasText: 'Tipo' }) })
    .locator('select')
    .selectOption({ label });
  await listResponse;
}

export async function filterByMarket(page: Page, label: string): Promise<void> {
  const listResponse = page.waitForResponse(
    (r) => isApiDividendPaymentsListResponse(r, 'GET') && r.ok()
  );
  await paymentsListSection(page)
    .locator('label')
    .filter({ has: page.locator('span.label-text', { hasText: 'Mercado' }) })
    .locator('select')
    .selectOption({ label });
  await listResponse;
}

export async function filterByDateRange(
  page: Page,
  fromBr: string,
  toBr: string
): Promise<void> {
  const section = paymentsListSection(page);
  const fromInput = section
    .locator('label')
    .filter({ has: page.locator('span.label-text', { hasText: 'Data inicial' }) })
    .getByPlaceholder('DD/MM/AAAA');
  const toInput = section
    .locator('label')
    .filter({ has: page.locator('span.label-text', { hasText: 'Data final' }) })
    .getByPlaceholder('DD/MM/AAAA');

  const listResponse = page.waitForResponse(
    (r) => isApiDividendPaymentsListResponse(r, 'GET') && r.ok()
  );
  await fromInput.fill(fromBr);
  await fromInput.blur();
  await toInput.fill(toBr);
  await toInput.blur();
  await listResponse;
}

export async function clickSortColumn(page: Page, column: 'Data' | 'Valor' | 'Ativo'): Promise<void> {
  await paymentsListSection(page).getByRole('button', { name: new RegExp(`^${column}`) }).click();
}

export function paymentRow(page: Page, ticker: string): Locator {
  return paymentsTable(page).locator('tr').filter({ hasText: ticker }).first();
}

export async function clickEditOnRow(page: Page, ticker: string): Promise<void> {
  await paymentRow(page, ticker).getByRole('button', { name: 'Editar' }).click();
}

export async function clickDeleteOnRow(page: Page, ticker: string): Promise<void> {
  const deleteResponse = page.waitForResponse((r) => isApiDividendPaymentDeleteResponse(r) && r.ok());
  await paymentRow(page, ticker).getByRole('button', { name: 'Remover' }).click();
  await deleteResponse;
}

export function editProventoModal(page: Page): Locator {
  return page.locator('.modal-box').filter({ hasText: 'Editar provento' });
}

export async function saveEditProventoModal(page: Page): Promise<void> {
  const patchResponse = page.waitForResponse((r) => isApiDividendPaymentPatchResponse(r) && r.ok());
  await editProventoModal(page).getByRole('button', { name: 'Salvar alterações' }).click();
  await patchResponse;
}

export async function fillEditProventoModal(
  page: Page,
  options: { dateBr?: string; amount?: string; taxWithheld?: string }
): Promise<void> {
  const modal = editProventoModal(page);
  if (options.dateBr) {
    await modal.getByPlaceholder('DD/MM/AAAA').fill(options.dateBr);
  }
  if (options.amount) {
    await modal
      .locator('label')
      .filter({ has: page.locator('span', { hasText: 'Recebido' }) })
      .locator('input')
      .fill(options.amount);
  }
  if (options.taxWithheld) {
    await modal
      .locator('label')
      .filter({ has: page.locator('span', { hasText: 'Imposto retido' }) })
      .locator('input')
      .fill(options.taxWithheld);
  }
}

export function acceptDialogs(page: Page): void {
  page.on('dialog', (dialog) => dialog.accept());
}

export async function expectPaymentsCounter(page: Page, text: string | RegExp): Promise<void> {
  await expect(paymentsListSection(page).locator('.badge')).toContainText(text);
}
