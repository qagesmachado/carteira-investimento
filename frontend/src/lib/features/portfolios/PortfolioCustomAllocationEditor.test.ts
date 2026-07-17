import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import { defaultAllocationTargets } from '$lib/features/rebalance/allocationTargets';

import PortfolioCustomAllocationEditor from './PortfolioCustomAllocationEditor.svelte';

describe('PortfolioCustomAllocationEditor', () => {
  it('delega para RebalanceClassTargetsEditor', () => {
    const targets = defaultAllocationTargets();
    render(PortfolioCustomAllocationEditor, {
      props: { targets }
    });

    expect(screen.getByTestId('portfolio-custom-allocation-editor')).toBeTruthy();
    expect(screen.getByTestId('custom-allocation-sum').textContent).toContain('100%');
  });
});
