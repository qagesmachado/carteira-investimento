import { expect, type Locator, type Page } from '@playwright/test';

import {
  isApiAnalysisAssetsListResponse,
  isApiAnalysisConfigGetResponse,
  isApiAnalysisConfigPutResponse,
  isApiAnalysisScoresPutResponse
} from './apiResponses';

export async function gotoAcoesBrPage(page: Page): Promise<void> {
  const responses = Promise.all([
    page.waitForResponse((r) => isApiAnalysisConfigGetResponse(r) && r.ok()),
    page.waitForResponse((r) => isApiAnalysisAssetsListResponse(r) && r.ok())
  ]);
  await page.goto('/analise/acoes-br');
  await responses;
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

export async function saveAnalysisPanel(page: Page): Promise<void> {
  const saveResponse = page.waitForResponse((r) => isApiAnalysisScoresPutResponse(r) && r.ok());
  await analysisPanel(page).getByRole('button', { name: 'Salvar classificação' }).click();
  await saveResponse;
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

export async function expectViabilityBadge(page: Page, ticker: string, text: string | RegExp): Promise<void> {
  await expect(analysisRow(page, ticker).locator('.badge')).toContainText(text);
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
