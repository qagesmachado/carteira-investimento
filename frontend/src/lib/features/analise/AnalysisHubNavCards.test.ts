import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import AnalysisHubNavCards from './AnalysisHubNavCards.svelte';

describe('AnalysisHubNavCards', () => {
  it('renderiza atalhos para as quatro áreas de análise', () => {
    render(AnalysisHubNavCards);

    expect(screen.getByTestId('analysis-hub-nav-acoes').getAttribute('href')).toBe(
      '/analise/acoes-br'
    );
    expect(screen.getByTestId('analysis-hub-nav-fiis').getAttribute('href')).toBe('/analise/fiis');
    expect(screen.getByTestId('analysis-hub-nav-internacional').getAttribute('href')).toBe(
      '/analise/internacional'
    );
    expect(screen.getByTestId('analysis-hub-nav-cripto').getAttribute('href')).toBe(
      '/analise/criptomoedas'
    );
  });
});
