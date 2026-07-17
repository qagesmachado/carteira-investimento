import { render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import AnalysisMethodologySelector from './AnalysisMethodologySelector.svelte';

describe('AnalysisMethodologySelector', () => {
  it('renderiza opções da metodologia', () => {
    render(AnalysisMethodologySelector, {
      profileSlug: 'stock-br',
      value: 'simples'
    });
    expect(screen.getByTestId('analysis-methodology-option-simples')).toBeTruthy();
    expect(screen.getByTestId('analysis-methodology-option-auvp')).toBeTruthy();
  });

  it('dispara onChange ao selecionar opção disponível', async () => {
    const onChange = vi.fn();
    vi.stubGlobal('confirm', () => true);
    render(AnalysisMethodologySelector, {
      profileSlug: 'stock-br',
      value: 'simples',
      onChange
    });
    await screen.getByTestId('analysis-methodology-option-auvp').click();
    expect(onChange).toHaveBeenCalledWith('auvp');
    vi.unstubAllGlobals();
  });
});
