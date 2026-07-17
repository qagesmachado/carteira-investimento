import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import AnalysisPendingCheckbox from './AnalysisPendingCheckbox.svelte';

describe('AnalysisPendingCheckbox', () => {
  it('reflete checked após remount quando prop muda', async () => {
    const { component } = render(AnalysisPendingCheckbox, { checked: false });
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', false);

    await component.$set({ checked: true });
    expect(screen.getByRole('checkbox')).toHaveProperty('checked', true);
  });

  it('dispara onToggle ao marcar', async () => {
    const onToggle = vi.fn();
    render(AnalysisPendingCheckbox, { checked: false, onToggle });
    await fireEvent.click(screen.getByRole('checkbox'));
    expect(onToggle).toHaveBeenCalledWith(true);
  });
});
