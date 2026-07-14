import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import type { Portfolio, PortfolioSummary } from '$lib/api/portfolios';
import PortfolioDetailSummaryPanel from './PortfolioDetailSummaryPanel.svelte';

const portfolio: Portfolio = {
  id: 2,
  name: 'Controle investimento',
  holder: 'Gustavo',
  objective: 'Crescimento patrimonial',
  base_currency: 'BRL',
  status: 'active',
  allocation_targets_json:
    '{"classes":{"stocks":20,"funds":7,"international":15,"fixed_income":55,"crypto":3},"stocks_split":{"etf":70,"stock":30}}',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};

const summary: PortfolioSummary = {
  portfolio_id: 2,
  invested_brl: 1580,
  current_brl: 1628.23,
  profit_brl: 48.23,
  profit_pct: 3.1,
  position_count: 2,
  is_active: true
};

describe('PortfolioDetailSummaryPanel', () => {
  it('exibe KPIs e alocação detailed compact', () => {
    render(PortfolioDetailSummaryPanel, {
      props: {
        portfolio,
        summary,
        onEdit: () => undefined,
        onDelete: () => undefined
      }
    });

    expect(screen.getByTestId('portfolio-detail-summary')).toBeTruthy();
    expect(screen.queryByText('Titular: Gustavo')).toBeNull();
    expect(screen.queryByText('Crescimento patrimonial')).toBeNull();
    expect(screen.getByText('Total aplicado')).toBeTruthy();
    expect(screen.getByText('Total atual')).toBeTruthy();
    expect(screen.getByText('Lucro')).toBeTruthy();
    const allocation = screen.getByTestId('portfolio-hub-allocation');
    expect(allocation.getAttribute('data-allocation-variant')).toBe('inlineMedium');
    expect(screen.getByTestId('portfolio-hub-rebalance-link')).toBeTruthy();
    expect(screen.getByTestId('portfolio-allocation-stocks')).toBeTruthy();
  });

  it('dispara callbacks de editar e excluir', () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    render(PortfolioDetailSummaryPanel, {
      props: { portfolio, summary, onEdit, onDelete }
    });

    fireEvent.click(screen.getByTestId('portfolio-detail-edit'));
    fireEvent.click(screen.getByTestId('portfolio-positions-delete'));
    expect(onEdit).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('desabilita Excluir quando trava está ativa', () => {
    render(PortfolioDetailSummaryPanel, {
      props: {
        portfolio: { ...portfolio, delete_locked: true },
        summary,
        onEdit: () => undefined,
        onDelete: () => undefined,
        deleteLocked: true
      }
    });

    expect((screen.getByTestId('portfolio-positions-delete') as HTMLButtonElement).disabled).toBe(
      true
    );
  });
});
