import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import type { ClassRebalanceRow } from '$lib/api/rebalance';
import RebalanceKpiCards from './RebalanceKpiCards.svelte';
import RebalanceSimulationPanel from './RebalanceSimulationPanel.svelte';

const sampleClasses: ClassRebalanceRow[] = [
  {
    display_class: 'stocks',
    label: 'Ações/ETF BR',
    current_value_brl: 28_664,
    current_percent: 24.2,
    target_percent: 30,
    target_value_brl: 35_535,
    gap_brl: 6_871
  },
  {
    display_class: 'international',
    label: 'Internacional',
    current_value_brl: 26_651,
    current_percent: 22.5,
    target_percent: 20,
    target_value_brl: 23_690,
    gap_brl: 0
  }
];

describe('RebalanceSimulationPanel', () => {
  it('renderiza modos de simulação e campo de valor', () => {
    render(RebalanceSimulationPanel, {
      props: {
        mode: 'final_total',
        amountInput: 0,
        patrimonyBrl: 118_450,
        resolvedInvestmentBrl: 0
      }
    });

    expect(screen.getByTestId('rebalance-simulation-panel')).toBeTruthy();
    expect(screen.getByTestId('rebalance-simulation-mode-total')).toBeTruthy();
    expect(screen.getByTestId('rebalance-simulation-mode-invest')).toBeTruthy();
    expect(screen.getByLabelText('Patrimônio final desejado')).toBeTruthy();
    expect(screen.getByTestId('rebalance-config-link')).toBeTruthy();
  });

  it('alterna label do campo para valor a investir', async () => {
    render(RebalanceSimulationPanel, {
      props: {
        mode: 'final_total',
        amountInput: 0,
        patrimonyBrl: 118_450,
        resolvedInvestmentBrl: 0
      }
    });

    await fireEvent.click(screen.getByTestId('rebalance-simulation-mode-invest'));
    expect(screen.getByLabelText('Valor a investir')).toBeTruthy();
  });

  it('exibe aporte calculado no modo por valor total', () => {
    render(RebalanceSimulationPanel, {
      props: {
        mode: 'final_total',
        amountInput: 125_000,
        patrimonyBrl: 118_450,
        resolvedInvestmentBrl: 6_550,
        finalPatrimonyBrl: 125_000,
        totalSuggestedContributionBrl: 6_550
      }
    });

    expect(screen.getByTestId('rebalance-simulation-resolved-investment').textContent).toContain(
      '6.550'
    );
    expect(screen.getByTestId('rebalance-simulation-final-patrimony').textContent).toContain(
      '125.000'
    );
  });
});

describe('RebalanceKpiCards', () => {
  it('renderiza KPIs de patrimônio e contagem de classes', () => {
    render(RebalanceKpiCards, {
      props: {
        classes: sampleClasses,
        patrimonyBrl: 118_450,
        totalGapBrl: 6_550
      }
    });

    expect(screen.getByTestId('rebalance-kpi-patrimony').textContent).toContain('118.450');
    expect(screen.getByTestId('rebalance-kpi-total-gap').textContent).toContain('6.550');
    expect(screen.getByTestId('rebalance-kpi-above-target').textContent).toContain('1 classe');
    expect(screen.getByTestId('rebalance-kpi-below-target').textContent).toContain('1 classe');
  });
});
