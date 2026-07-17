import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import { defaultAllocationTargets } from '$lib/features/rebalance/allocationTargets';

import RebalanceTargetsPreview from './RebalanceTargetsPreview.svelte';

describe('RebalanceTargetsPreview', () => {
  it('exibe soma valida e legenda das classes', () => {
    const targets = defaultAllocationTargets();
    render(RebalanceTargetsPreview, {
      props: { targets }
    });

    expect(screen.getByTestId('rebalance-targets-class-sum').textContent).toContain('100%');
    expect(screen.getByTestId('rebalance-targets-class-badge').className).toContain('badge-success');
    expect(screen.getByTestId('rebalance-targets-legend').textContent).toContain('Ações/ETF BR');
  });

  it('indica erro quando soma das classes difere de 100%', () => {
    const targets = defaultAllocationTargets();
    targets.classes.fixed_income = 60;
    render(RebalanceTargetsPreview, {
      props: { targets }
    });

    expect(screen.getByTestId('rebalance-targets-class-badge').className).toContain('badge-error');
  });

  it('oculta badge de split quando stocks e menor que 1%', () => {
    const targets = defaultAllocationTargets();
    targets.classes.stocks = 0;
    render(RebalanceTargetsPreview, {
      props: { targets }
    });

    expect(screen.queryByTestId('rebalance-targets-split-badge')).toBeNull();
  });

  it('mostra badge de conjunto unico no modo unified', () => {
    const targets = defaultAllocationTargets();
    targets.stocks_split_mode = 'unified';
    render(RebalanceTargetsPreview, {
      props: { targets }
    });

    expect(screen.getByTestId('rebalance-targets-split-badge').textContent).toContain('Conjunto único');
  });
});
