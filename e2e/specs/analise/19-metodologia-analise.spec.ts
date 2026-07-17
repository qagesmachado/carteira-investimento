import { expect, test } from '../fixtures/test';

import { E2E_PORTFOLIO_PRINCIPAL, TICKER_BBSE3 } from '../helpers/e2eFixtures';
import {
  analysisMethodologySelector,
  analysisTableSection,
  gotoAcoesBrPage,
  gotoInternacionalPage,
  selectAnalysisMethodology,
  waitStockBrMethodologyLoaded
} from '../helpers/analisePage';
import { clearAllTestAssets, createAssetViaApi } from '../helpers/seedAssets';
import {
  clearAllPortfolios,
  createPortfolio,
  createPosition,
  getAssetIdBySymbol,
  setActivePortfolio
} from '../helpers/testPortfolios';
import { getWorkerApiBaseUrl } from '../helpers/workerContext';

/**
 * UI-ANL-019 — Metodologia Simples / AUVP
 * @see ../../../casos-de-uso/ui/analise/19-metodologia-analise.md
 */
test.describe('UI-ANL-019', () => {
  test('nova carteira inicia em Simples e pode trocar para AUVP', async ({ page, request }) => {
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
    await clearAllPortfolios(request);
    await createAssetViaApi(request, {
      symbol: TICKER_BBSE3,
      name: 'BB Seguridade Participações S.A.',
      asset_type: 'stock',
      market: 'national',
      country: 'BR',
      currency: 'BRL'
    });
    const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
    const bbse3Id = await getAssetIdBySymbol(request, TICKER_BBSE3);
    await createPosition(request, portfolio.id, bbse3Id, { quantity: 100, average_price: 32.5 });
    await setActivePortfolio(request, portfolio.id);

    const methodologyResponse = await request.get(
      `${getWorkerApiBaseUrl()}/analysis/profiles/stock-br/methodology?portfolio_id=${portfolio.id}`
    );
    expect(methodologyResponse.ok()).toBeTruthy();
    expect((await methodologyResponse.json()).methodology).toBe('simples');

    const methodologyLoaded = waitStockBrMethodologyLoaded(page);
    await gotoAcoesBrPage(page);
    await methodologyLoaded;
    await expect(analysisMethodologySelector(page)).toBeVisible();
    await expect(page.getByTestId('analysis-methodology-option-simples')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByTestId('analysis-acoes-allocation-section')).toBeVisible();
    await expect(analysisTableSection(page)).toHaveCount(0);

    await selectAnalysisMethodology(page, 'auvp');
    await expect(page.getByTestId('analysis-methodology-option-auvp')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(analysisTableSection(page)).toBeVisible();
    await expect(page.getByTestId('analysis-sum-config-open')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Classificar' }).first()).toBeVisible();
  });

  test('internacional mantém Simples e AUVP desabilitado', async ({ page, request }) => {
    await clearAllTestAssets(request, getWorkerApiBaseUrl());
    await clearAllPortfolios(request);
    const portfolio = await createPortfolio(request, E2E_PORTFOLIO_PRINCIPAL);
    await setActivePortfolio(request, portfolio.id);

    await gotoInternacionalPage(page);
    await expect(analysisMethodologySelector(page)).toBeVisible();
    await expect(page.getByTestId('analysis-methodology-option-simples')).toHaveAttribute(
      'aria-pressed',
      'true'
    );
    await expect(page.getByTestId('analysis-methodology-option-auvp')).toBeDisabled();
    await expect(page.getByTestId('analysis-methodology-option-auvp')).toContainText('Em breve');
  });
});
