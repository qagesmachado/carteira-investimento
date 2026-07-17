import { render, screen } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import AnalysisOverviewSection from './AnalysisOverviewSection.svelte';

describe('AnalysisOverviewSection', () => {
  it('exibe orientações com visão geral e como configurar', () => {
    render(AnalysisOverviewSection);

    expect(screen.getByRole('heading', { name: 'Orientações' })).toBeTruthy();
    expect(screen.getByTestId('analysis-overview-vision').textContent).toMatch(/centro de análise/);
    expect(screen.getByTestId('analysis-overview-config').textContent).toMatch(/Como configurar/i);
    expect(screen.getByTestId('analysis-overview-config').textContent).toMatch(/métodos/);
    expect(screen.getByTestId('analysis-overview-config').textContent).toMatch(
      /balanceamento adequado/
    );
  });
});
