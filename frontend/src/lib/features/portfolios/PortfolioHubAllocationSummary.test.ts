import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import { allocationTargetsJsonForProfile } from './portfolioInvestorProfiles';
import PortfolioHubAllocationSummary from './PortfolioHubAllocationSummary.svelte';

describe('PortfolioHubAllocationSummary', () => {
  it('modo compacto exibe perfil e link para rebalanceamento', () => {
    render(PortfolioHubAllocationSummary, {
      props: {
        allocationTargetsJson: allocationTargetsJsonForProfile('moderate'),
        variant: 'compact'
      }
    });

    expect(screen.getByTestId('portfolio-hub-allocation')).toBeTruthy();
    expect(screen.getByText('Balanceamento sugerido')).toBeTruthy();
    expect(screen.getByText('Moderado')).toBeTruthy();
    expect(screen.getByTestId('portfolio-hub-rebalance-link')).toBeTruthy();
    expect(screen.queryByTestId('portfolio-allocation-stocks')).toBeNull();
  });

  it('modo preview exibe icones por classe no modal de criacao', () => {
    render(PortfolioHubAllocationSummary, {
      props: {
        allocationTargetsJson: allocationTargetsJsonForProfile('moderate'),
        variant: 'preview'
      }
    });

    expect(screen.getByTestId('portfolio-allocation-stocks')).toBeTruthy();
    expect(screen.getByTestId('portfolio-allocation-fixed_income')).toBeTruthy();
    expect(screen.queryByTestId('portfolio-hub-rebalance-link')).toBeNull();
    expect(screen.queryByTestId('portfolio-allocation-stocks-split')).toBeNull();
  });

  it('modo inlineMedium exibe classes em linha com tamanho medio na pagina de posicoes', () => {
    render(PortfolioHubAllocationSummary, {
      props: {
        allocationTargetsJson: allocationTargetsJsonForProfile('moderate'),
        variant: 'inlineMedium'
      }
    });

    const section = screen.getByTestId('portfolio-hub-allocation');
    expect(section.getAttribute('data-allocation-variant')).toBe('inlineMedium');
    expect(screen.getByTestId('portfolio-allocation-inline-medium')).toBeTruthy();
    expect(screen.getByTestId('portfolio-allocation-stocks')).toBeTruthy();
    expect(screen.getByTestId('portfolio-hub-rebalance-link')).toBeTruthy();
    expect(screen.queryByTestId('portfolio-allocation-compact-grid')).toBeNull();
    expect(screen.queryByText(/Rebalanceamento → Configuração/)).toBeNull();
  });

  it('modo inline exibe classes em linha com link na pagina de posicoes', () => {
    render(PortfolioHubAllocationSummary, {
      props: {
        allocationTargetsJson: allocationTargetsJsonForProfile('moderate'),
        variant: 'inline'
      }
    });

    const section = screen.getByTestId('portfolio-hub-allocation');
    expect(section.getAttribute('data-allocation-variant')).toBe('inline');
    expect(screen.getByTestId('portfolio-allocation-stocks')).toBeTruthy();
    expect(screen.getByTestId('portfolio-hub-rebalance-link')).toBeTruthy();
    expect(screen.queryByText(/Rebalanceamento → Configuração/)).toBeNull();
  });

  it('modo detailed exibe cards por classe com link no editar', () => {
    render(PortfolioHubAllocationSummary, {
      props: {
        allocationTargetsJson: allocationTargetsJsonForProfile('moderate'),
        variant: 'detailed'
      }
    });

    expect(screen.getByTestId('portfolio-allocation-stocks')).toBeTruthy();
    expect(screen.getByTestId('portfolio-hub-rebalance-link')).toBeTruthy();
    expect(screen.queryByTestId('portfolio-allocation-stocks-split')).toBeNull();
  });
});
