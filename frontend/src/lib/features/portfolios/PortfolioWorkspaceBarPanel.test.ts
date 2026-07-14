import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import type { Portfolio } from '$lib/api/portfolios';
import PortfolioWorkspaceBarPanel from './PortfolioWorkspaceBarPanel.svelte';

const portfolios: Portfolio[] = [
  {
    id: 1,
    name: 'Carteira Gabriel',
    base_currency: 'BRL',
    status: 'active',
    created_at: '2026-01-01T00:00:00Z',
    updated_at: '2026-01-01T00:00:00Z'
  }
];

describe('PortfolioWorkspaceBarPanel', () => {
  it('renderiza painel padrao com barra do dashboard', () => {
    render(PortfolioWorkspaceBarPanel, {
      props: {
        portfolios,
        activeId: 1,
        activePortfolioName: 'Carteira Gabriel',
        portfolioSelectTestId: 'portfolio-positions-select'
      }
    });

    expect(screen.getByTestId('portfolio-workspace-bar')).toBeTruthy();
    expect(screen.getByTestId('dashboard-portfolio-bar')).toBeTruthy();
    const select = screen.getByTestId('portfolio-positions-select') as HTMLSelectElement;
    expect(select.value).toBe('1');
    expect(screen.getByTestId('dashboard-status-badges')).toBeTruthy();
  });
});
