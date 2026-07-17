import { fireEvent, render, screen, waitFor } from '@testing-library/svelte';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const getAnalysisPortfolioPending = vi.fn();

vi.mock('$lib/api/analysis', () => ({
  getAnalysisPortfolioPending: (...args: unknown[]) => getAnalysisPortfolioPending(...args)
}));

import AnalysisPendingAssetsModal from './AnalysisPendingAssetsModal.svelte';

describe('AnalysisPendingAssetsModal', () => {
  beforeEach(() => {
    getAnalysisPortfolioPending.mockReset();
  });

  it('carrega e agrupa ativos pendentes por profile', async () => {
    getAnalysisPortfolioPending.mockResolvedValue({
      portfolio_id: 7,
      groups: [
        {
          profile: 'stock_br',
          assets: [
            {
              asset_id: 1,
              symbol: 'BBSE3',
              name: 'BB Seguridade',
              asset_type: 'stock',
              profile: 'stock_br'
            }
          ]
        },
        {
          profile: 'fii_br',
          assets: [
            {
              asset_id: 2,
              symbol: 'HGLG11',
              name: 'CSHG Logística',
              asset_type: 'fii',
              profile: 'fii_br'
            }
          ]
        }
      ]
    });

    render(AnalysisPendingAssetsModal, { open: true, portfolioId: 7 });

    await waitFor(() => {
      expect(screen.getByTestId('analysis-pending-assets-count').textContent).toMatch(
        /2 ativos pendentes/
      );
    });

    expect(getAnalysisPortfolioPending).toHaveBeenCalledWith(7);
    expect(screen.getByTestId('analysis-pending-group-stock_br').textContent).toMatch(
      /Ações\/ETF BR/
    );
    expect(screen.getByTestId('analysis-pending-group-fii_br').textContent).toMatch(/FIIs/);
    expect(screen.getByTestId('analysis-pending-asset-1').textContent).toMatch(/BBSE3/);
    expect(screen.getByTestId('analysis-pending-asset-2').textContent).toMatch(/HGLG11/);
  });

  it('exibe estado vazio quando não há pendentes', async () => {
    getAnalysisPortfolioPending.mockResolvedValue({ portfolio_id: 7, groups: [] });

    render(AnalysisPendingAssetsModal, { open: true, portfolioId: 7 });

    await waitFor(() => {
      expect(screen.getByTestId('analysis-pending-assets-empty')).toBeTruthy();
    });
  });

  it('fecha ao clicar em Fechar', async () => {
    getAnalysisPortfolioPending.mockResolvedValue({ portfolio_id: 7, groups: [] });
    const onClose = vi.fn();

    render(AnalysisPendingAssetsModal, { open: true, portfolioId: 7, onClose });
    await waitFor(() => {
      expect(screen.getByTestId('analysis-pending-assets-close')).toBeTruthy();
    });

    await fireEvent.click(screen.getByTestId('analysis-pending-assets-close'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
