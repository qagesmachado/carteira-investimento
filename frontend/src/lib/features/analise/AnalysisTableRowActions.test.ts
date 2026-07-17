import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import AnalysisTableRowActions from './AnalysisTableRowActions.svelte';

describe('AnalysisTableRowActions', () => {
  it('exibe badge pendente e botão classificar com aria-label', () => {
    render(AnalysisTableRowActions, { isPending: true });
    expect(screen.getByText('Pendente')).toBeTruthy();
    expect(screen.getByRole('button', { name: 'Classificar' })).toBeTruthy();
    expect(screen.getByTestId('lucide-icon-Tags')).toBeTruthy();
  });

  it('dispara onClassify ao clicar', async () => {
    const onClassify = vi.fn();
    render(AnalysisTableRowActions, { onClassify });
    await fireEvent.click(screen.getByRole('button', { name: 'Classificar' }));
    expect(onClassify).toHaveBeenCalledTimes(1);
  });
});
