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
