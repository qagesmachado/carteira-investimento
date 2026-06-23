import { expect, type Locator, type Page } from '@playwright/test';

import {
  isApiAnalysisAssetsListResponse,
  isApiAnalysisConfigGetResponse,
  isApiAnalysisConfigPutResponse,
  isApiAnalysisScoresPutResponse,
  isApiCryptoAllocationsPutResponse,
  isApiEtfIntlAllocationsPutResponse,
  isApiFiiSegmentsGetResponse
} from './apiResponses';

export async function gotoAcoesBrPage(page: Page): Promise<void> {
  const responses = Promise.all([
    page.waitForResponse((r) => isApiAnalysisConfigGetResponse(r) && r.ok()),
    page.waitForResponse((r) => isApiAnalysisAssetsListResponse(r) && r.ok())
  ]);
  await page.goto('/analise/acoes-br');
  await responses;
}

export async function gotoInternacionalPage(page: Page): Promise<void> {
  const assetsResponse = page.waitForResponse(
    (r) => isApiAnalysisAssetsListResponse(r) && r.url().includes('profile=etf_intl') && r.ok()
  );
  await page.goto('/analise/internacional');
  await assetsResponse;
}

export async function gotoCriptomoedasPage(page: Page): Promise<void> {
  const assetsResponse = page.waitForResponse(
    (r) => isApiAnalysisAssetsListResponse(r) && r.url().includes('profile=crypto') && r.ok()
  );
  await page.goto('/analise/criptomoedas');
  await assetsResponse;
}

export function cryptoAnalysisTableSection(page: Page): Locator {
  return page.locator('section.card').filter({ has: page.getByRole('heading', { name: 'Criptomoedas' }) });
}

export function cryptoAnalysisTable(page: Page): Locator {
  return cryptoAnalysisTableSection(page).locator('table tbody');
}

export function cryptoAnalysisRow(page: Page, ticker: string): Locator {
  return cryptoAnalysisTable(page).locator('tr').filter({ hasText: ticker }).first();
}

export async function saveCryptoAllocation(page: Page): Promise<void> {
  const saveResponse = page.waitForResponse((r) => isApiCryptoAllocationsPutResponse(r) && r.ok());
  await page.getByRole('button', { name: 'Salvar alocação' }).click();
  await saveResponse;
  await expect(page.getByText('Alocação salva com sucesso.')).toBeVisible();
}

export async function gotoFiisPage(page: Page): Promise<void> {
  const responses = Promise.all([
    page.waitForResponse((r) => isApiAnalysisConfigGetResponse(r) && r.ok()),
    page.waitForResponse((r) => isApiAnalysisAssetsListResponse(r) && r.ok()),
    page.waitForResponse((r) => isApiFiiSegmentsGetResponse(r) && r.ok())
  ]);
  await page.goto('/analise/fiis');
  await responses;
}

export function analysisConfigProfileTabs(page: Page): Locator {
  return page.getByRole('tablist', { name: 'Perfil da configuração' });
}

export async function gotoFiiConfigPage(page: Page): Promise<void> {
  const configResponse = page.waitForResponse((r) => isApiAnalysisConfigGetResponse(r) && r.ok());
  await page.goto('/analise/configuracao?perfil=fiis');
  await configResponse;
}

export async function gotoFiiSegmentosPage(page: Page): Promise<void> {
  const segmentsResponse = page.waitForResponse(
    (r) => isApiFiiSegmentsGetResponse(r) && r.ok()
  );
  await page.goto('/analise/fiis/segmentos');
  await segmentsResponse;
}

export async function gotoAnaliseConfigPage(page: Page): Promise<void> {
  const configResponse = page.waitForResponse(
    (r) => isApiAnalysisConfigGetResponse(r) && r.ok()
  );
  await page.goto('/analise/configuracao');
  await configResponse;
}

export function analysisTableSection(page: Page): Locator {
  return page.locator('section.card').filter({ has: page.getByRole('heading', { name: 'Ações e ETFs (Brasil)' }) });
}

export function etfIntlAnalysisTableSection(page: Page): Locator {
  return page.locator('section.card').filter({ has: page.getByRole('heading', { name: 'ETFs internacionais' }) });
}

export function etfIntlAnalysisTable(page: Page): Locator {
  return etfIntlAnalysisTableSection(page).locator('table tbody');
}

export function etfIntlAnalysisRow(page: Page, ticker: string): Locator {
  return etfIntlAnalysisTable(page).locator('tr').filter({ hasText: ticker }).first();
}

export async function saveEtfIntlAllocation(page: Page): Promise<void> {
  const saveResponse = page.waitForResponse((r) => isApiEtfIntlAllocationsPutResponse(r) && r.ok());
  await page.getByRole('button', { name: 'Salvar alocação' }).click();
  await saveResponse;
  await expect(page.getByText('Alocação salva com sucesso.')).toBeVisible();
}

export function fiiAnalysisTableSection(page: Page): Locator {
  return page.locator('section.card').filter({ has: page.getByRole('heading', { name: 'Fundos imobiliários (FIIs)' }) });
}

export function fiiAnalysisTable(page: Page): Locator {
  return fiiAnalysisTableSection(page).locator('table tbody');
}

export function fiiAnalysisDataRows(page: Page): Locator {
  return fiiAnalysisTable(page).locator('tr');
}

export async function clickFiiAnalysisColumnSort(page: Page, columnLabel: string): Promise<void> {
  await fiiAnalysisTableSection(page)
    .locator('thead th button')
    .filter({ hasText: columnLabel })
    .click();
}

export function fiiAnalysisRow(page: Page, ticker: string): Locator {
  return fiiAnalysisTable(page).locator('tr').filter({ hasText: ticker }).first();
}

export function analysisTable(page: Page): Locator {
  return analysisTableSection(page).locator('table tbody');
}

export function analysisRow(page: Page, ticker: string): Locator {
  return analysisTable(page).locator('tr').filter({ hasText: ticker }).first();
}

export async function clickClassificarOnRow(page: Page, ticker: string): Promise<void> {
  await analysisRow(page, ticker).getByRole('button', { name: 'Classificar' }).click();
}

export function analysisPanel(page: Page): Locator {
  return page.locator('.modal-box').filter({ hasText: 'Classificar —' });
}

export function analysisPreview(page: Page): Locator {
  return analysisPanel(page).getByTestId('fundamental-preview');
}

export async function expectPreviewText(
  page: Page,
  indicatorCode: string,
  text: string | RegExp
): Promise<void> {
  await expect(analysisPanel(page).getByTestId(`preview-${indicatorCode}-text`)).toHaveText(text);
}

export async function expectUnsavedChangesWarning(
  page: Page,
  visible = true
): Promise<void> {
  const alert = analysisPanel(page).getByRole('alert').filter({ hasText: /alterações não salvas/i });
  if (visible) {
    await expect(alert).toBeVisible();
  } else {
    await expect(alert).toHaveCount(0);
  }
}

export async function selectFundamentalScore(
  page: Page,
  label: string,
  optionLabel: string
): Promise<void> {
  const panel = analysisPanel(page);
  await panel
    .locator('label.form-control')
    .filter({ hasText: label })
    .locator('select')
    .selectOption({ label: optionLabel });
}

export async function selectViabilidade(page: Page, optionLabel: string): Promise<void> {
  const panel = analysisPanel(page);
  await panel
    .locator('label.form-control')
    .filter({ hasText: 'Viabilidade' })
    .locator('select')
    .selectOption({ label: optionLabel });
}

export async function answerDiagramQuestion(
  page: Page,
  legend: string,
  answer: 'sim' | 'nao'
): Promise<void> {
  const panel = analysisPanel(page);
  const suffix = answer === 'sim' ? 'Sim (+1)' : 'Não (-1)';
  await panel.getByRole('radio', { name: `${legend} — ${suffix}` }).check();
}

export async function openDiagramTab(page: Page): Promise<void> {
  await analysisPanel(page).getByRole('tab', { name: /Diagrama/i }).click();
}

export async function clickClassificarOnFiiRow(page: Page, ticker: string): Promise<void> {
  await fiiAnalysisRow(page, ticker).getByRole('button', { name: 'Classificar' }).click();
}

export async function saveAnalysisPanel(page: Page): Promise<void> {
  const saveResponse = page.waitForResponse((r) => isApiAnalysisScoresPutResponse(r) && r.ok());
  await analysisPanel(page).getByRole('button', { name: 'Salvar classificação' }).click();
  await saveResponse;
}

export async function cancelAnalysisPanel(page: Page): Promise<void> {
  await analysisPanel(page).getByRole('button', { name: 'Cancelar' }).click();
}

export async function expectFundamentalSelectValue(
  page: Page,
  label: string,
  optionLabel: string
): Promise<void> {
  const select = analysisPanel(page)
    .locator('label.form-control')
    .filter({ hasText: label })
    .locator('select');
  await expect(select.locator(`option:checked`)).toHaveText(optionLabel);
}

export async function expectSegmentSelectValue(
  page: Page,
  optionLabel: string
): Promise<void> {
  const select = analysisPanel(page)
    .locator('label.form-control')
    .filter({ hasText: 'Segmento' })
    .locator('select');
  await expect(select.locator('option:checked')).toHaveText(optionLabel);
}

export async function expectResetConfirmVisible(page: Page, visible = true): Promise<void> {
  const dialog = analysisPanel(page).getByRole('dialog', { name: 'Resetar classificação?' });
  if (visible) {
    await expect(dialog).toBeVisible();
  } else {
    await expect(dialog).toHaveCount(0);
  }
}

export async function saveAnalysisConfig(page: Page): Promise<void> {
  const saveResponse = page.waitForResponse((r) => isApiAnalysisConfigPutResponse(r) && r.ok());
  await page.getByRole('button', { name: 'Salvar configuração' }).click();
  await saveResponse;
}

export async function expectAnalysisRowScores(
  page: Page,
  ticker: string,
  scores: Record<string, string>
): Promise<void> {
  const row = analysisRow(page, ticker);
  for (const [label, value] of Object.entries(scores)) {
    await expect(row).toContainText(value);
  }
}

export async function expectViabilityBadge(
  page: Page,
  ticker: string,
  text: string | RegExp,
  profile: 'stock' | 'fii' = 'stock'
): Promise<void> {
  const row = profile === 'fii' ? fiiAnalysisRow(page, ticker) : analysisRow(page, ticker);
  await expect(row.locator('.badge')).toContainText(text);
}

export async function expectEmptyAnalysisState(page: Page): Promise<void> {
  await expect(page.getByText(/Crie ou selecione uma carteira/i)).toBeVisible();
}

export function setSumColumnDiagramMultiplier(page: Page, value: string): Promise<void> {
  return page.getByLabel('Multiplicador do diagrama').fill(value);
}

export async function clickClassificarInPortfolios(page: Page, ticker: string): Promise<void> {
  const configResponse = page.waitForResponse(
    (r) => isApiAnalysisConfigGetResponse(r) && r.ok()
  );
  await page
    .locator('table tbody tr')
    .filter({ hasText: ticker })
    .getByRole('button', { name: 'Classificar' })
    .click();
  await configResponse;
}

export async function expectNoClassificarInRow(page: Page, ticker: string): Promise<void> {
  await expect(
    page.locator('table tbody tr').filter({ hasText: ticker }).getByRole('button', { name: 'Classificar' })
  ).toHaveCount(0);
}
