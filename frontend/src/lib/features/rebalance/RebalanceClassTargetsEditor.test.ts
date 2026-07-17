import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import { defaultAllocationTargets } from '$lib/features/rebalance/allocationTargets';

import RebalanceClassTargetsEditor from './RebalanceClassTargetsEditor.svelte';

describe('RebalanceClassTargetsEditor', () => {
  it('atualiza percentual ao mover slider', async () => {
    const targets = defaultAllocationTargets();
    render(RebalanceClassTargetsEditor, {
      props: { targets }
    });

    const slider = screen.getByTestId('custom-allocation-slider-fixed_income');
    await fireEvent.input(slider, { target: { value: '60' } });

    expect(targets.classes.fixed_income).toBe(60);
    expect(screen.getByTestId('custom-allocation-sum').textContent).toContain('105%');
    expect(screen.getByTestId('custom-allocation-sum').className).toContain('text-error');
  });

  it('indica soma valida quando totaliza 100%', () => {
    const targets = defaultAllocationTargets();
    render(RebalanceClassTargetsEditor, {
      props: { targets }
    });

    expect(screen.getByTestId('custom-allocation-sum').textContent).toContain('100%');
    expect(screen.getByTestId('custom-allocation-sum').className).not.toContain('text-error');
  });
});
