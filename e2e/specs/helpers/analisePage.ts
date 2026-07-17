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

export async function waitStockBrMethodologyLoaded(page: Page): Promise<void> {
  await page.waitForResponse(
    (r) =>
      r.url().includes('/profiles/stock-br/methodology') &&
      r.request().method() === 'GET' &&
      r.ok()
  );
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
  return page.getByTestId('analysis-cripto-section');
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

export async function gotoAnaliseHub(page: Page): Promise<void> {
  await gotoAnaliseConfigPage(page);
}

export function analysisSectionTabs(page: Page): Locator {
  return page.getByTestId('analysis-section-tabs');
}

export function analysisConfigProfileTabs(page: Page): Locator {
  return page.getByTestId('analysis-config-profile-tabs');
}

export function analysisOverviewSection(page: Page): Locator {
  return page.getByTestId('analysis-overview-section');
}

export async function gotoFiiConfigPage(page: Page): Promise<void> {
  await gotoFiisPage(page);
}

export function analysisSumConfigSection(page: Page, profile: 'acoes' | 'fiis' = 'acoes'): Locator {
  const testId =
    profile === 'fiis' ? 'analysis-fiis-sum-config-section' : 'analysis-acoes-sum-config-section';
  return page.getByTestId(testId);
}

export function analysisSumConfigModal(page: Page): Locator {
  return page.getByTestId('analysis-sum-config-modal');
}

export async function openSumColumnConfigModal(page: Page): Promise<void> {
  await page.getByTestId('analysis-sum-config-open').click();
  await expect(analysisSumConfigModal(page)).toBeVisible();
}

export async function gotoFiiSegmentosPage(page: Page): Promise<void> {
  const segmentsResponse = page.waitForResponse(
    (r) => isApiFiiSegmentsGetResponse(r) && r.ok()
  );
  await page.goto('/analise/fiis/segmentos');
  await segmentsResponse;
}

export async function gotoAnaliseSumarioPage(page: Page): Promise<void> {
  await page.goto('/analise/sumario');
  await expect(page.getByTestId('analysis-summary-kpi-cards')).toBeVisible();
}

export async function gotoAnaliseConfigPage(page: Page): Promise<void> {
  await gotoAnaliseSumarioPage(page);
}

export function analysisTableSection(page: Page): Locator {
  return page.getByTestId('analysis-acoes-table-section');
}

export function etfIntlAnalysisTableSection(page: Page): Locator {
  return page.getByTestId('analysis-internacional-section');
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
  return page.getByTestId('analysis-fiis-table-section');
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

export function analysisPendingToggle(page: Page): Locator {
  return analysisPanel(page).getByTestId('analysis-pending-toggle').getByRole('checkbox');
}

export async function toggleAnalysisPendingDraft(page: Page, checked: boolean): Promise<void> {
  const checkbox = analysisPendingToggle(page);
  if (checked) {
    await checkbox.check();
  } else {
    await checkbox.uncheck();
  }
}

export async function expectAnalysisRowPendingBadge(
  page: Page,
  ticker: string,
  visible = true
): Promise<void> {
  const badge = analysisRow(page, ticker).getByText('Pendente', { exact: true });
  if (visible) {
    await expect(badge).toBeVisible();
  } else {
    await expect(badge).toHaveCount(0);
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

export async function saveAnalysisPanel(
  page: Page,
  options?: { withPending?: boolean }
): Promise<void> {
  const scoresPromise = page.waitForResponse((r) => isApiAnalysisScoresPutResponse(r) && r.ok());
  const pendingPromise = options?.withPending
    ? page.waitForResponse(
        (r) => r.url().includes('/pending') && r.request().method() === 'PUT' && r.ok()
      )
    : null;
  await analysisPanel(page).getByRole('button', { name: 'Salvar classificação' }).click();
  await scoresPromise;
  if (pendingPromise) {
    await pendingPromise;
  }
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
  const modal = analysisSumConfigModal(page);
  const saveButton = (await modal.isVisible())
    ? modal.getByTestId('analysis-methodology-save')
    : page.getByRole('button', { name: 'Salvar configuração' });
  await saveButton.click();
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

export async function setSumColumnDiagramMultiplier(page: Page, value: string): Promise<void> {
  if (!(await analysisSumConfigModal(page).isVisible())) {
    await openSumColumnConfigModal(page);
  }
  await analysisSumConfigModal(page).getByTestId('analysis-methodology-diagram-multiplier').fill(value);
}

export async function setAnalysisMethodologyComponents(
  page: Page,
  options: { fundamental?: boolean; diagram?: boolean }
): Promise<void> {
  if (!(await analysisSumConfigModal(page).isVisible())) {
    await openSumColumnConfigModal(page);
  }
  const modal = analysisSumConfigModal(page);
  if (options.fundamental != null) {
    const checkbox = modal.getByTestId('analysis-methodology-use-fundamental');
    if (options.fundamental) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }
  if (options.diagram != null) {
    const checkbox = modal.getByTestId('analysis-methodology-use-diagram');
    if (options.diagram) {
      await checkbox.check();
    } else {
      await checkbox.uncheck();
    }
  }
}

export function analysisMethodologySelector(page: Page): Locator {
  return page.getByTestId('analysis-methodology-selector');
}

export async function selectAnalysisMethodology(
  page: Page,
  methodology: 'simples' | 'auvp',
  options: { acceptConfirm?: boolean } = {}
): Promise<void> {
  const { acceptConfirm = true } = options;
  if (acceptConfirm) {
    page.once('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });
  }
  const putResponse = page.waitForResponse(
    (r) => r.url().includes('/methodology') && r.request().method() === 'PUT' && r.ok()
  );
  await page.getByTestId(`analysis-methodology-option-${methodology}`).click();
  await putResponse;
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
  const row = page.locator('table tbody tr').filter({ hasText: ticker });
  await expect(row.getByRole('button', { name: 'Classificar', disabled: false })).toHaveCount(0);
}
