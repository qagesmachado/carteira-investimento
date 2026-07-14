import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import type { Portfolio, PortfolioSummary } from '$lib/api/portfolios';
import PortfolioHubCard from './PortfolioHubCard.svelte';

const portfolio: Portfolio = {
  id: 1,
  name: 'Carteira Principal',
  base_currency: 'BRL',
  status: 'active',
  allocation_targets_json: '{"classes":{"stocks":20,"funds":7,"international":15,"fixed_income":55,"crypto":3},"stocks_split":{"etf":70,"stock":30}}',
  created_at: '2026-01-01T00:00:00Z',
  updated_at: '2026-01-01T00:00:00Z'
};

const summary: PortfolioSummary = {
  portfolio_id: 1,
  invested_brl: 1000,
  current_brl: 1100,
  profit_brl: 100,
  profit_pct: 10,
  position_count: 2,
  is_active: true
};

describe('PortfolioHubCard', () => {
  it('marca carteira em uso sem badge de status duplicado', () => {
    render(PortfolioHubCard, {
      props: { portfolio, summary, onOpen: () => undefined, onEdit: () => undefined }
    });

    const card = screen.getByTestId('portfolio-hub-card');
    expect(card.getAttribute('data-active')).toBe('true');
    expect(card.className).toContain('ring-primary');
    expect(screen.queryByText('Ativa')).toBeNull();
    expect(screen.queryByText('ativa')).toBeNull();
    expect(screen.getByTestId('portfolio-hub-allocation')).toBeTruthy();
    expect(screen.getByText('Balanceamento sugerido')).toBeTruthy();
  });

  it('exibe badge apenas para status não padrão', () => {
    render(PortfolioHubCard, {
      props: {
        portfolio: { ...portfolio, status: 'simulation' },
        summary: { ...summary, is_active: false },
        onOpen: () => undefined,
        onEdit: () => undefined
      }
    });

    expect(screen.getByText('Simulação')).toBeTruthy();
    expect(screen.getByTestId('portfolio-hub-card').getAttribute('data-active')).toBe('false');
  });

  it('expõe botão Editar no card', () => {
    const onEdit = vi.fn();
    render(PortfolioHubCard, {
      props: { portfolio, summary, onOpen: () => undefined, onEdit }
    });

    fireEvent.click(screen.getByTestId('portfolio-hub-edit'));
    expect(onEdit).toHaveBeenCalledTimes(1);
  });

  it('expõe botão Excluir no card', () => {
    const onDelete = vi.fn();
    render(PortfolioHubCard, {
      props: { portfolio, summary, onOpen: () => undefined, onEdit: () => undefined, onDelete }
    });

    fireEvent.click(screen.getByTestId('portfolio-hub-delete'));
    expect(onDelete).toHaveBeenCalledTimes(1);
  });

  it('desabilita Excluir quando trava está ativa', () => {
    render(PortfolioHubCard, {
      props: {
        portfolio: { ...portfolio, delete_locked: true },
        summary,
        onOpen: () => undefined,
        onEdit: () => undefined,
        onDelete: () => undefined,
        deleteLocked: true
      }
    });

    expect((screen.getByTestId('portfolio-hub-delete') as HTMLButtonElement).disabled).toBe(true);
  });
});
