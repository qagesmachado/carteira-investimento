import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import AnalysisSummaryKpiCards from './AnalysisSummaryKpiCards.svelte';

describe('AnalysisSummaryKpiCards', () => {
  it('exibe contagens de classificados e pendentes', () => {
    render(AnalysisSummaryKpiCards, { classifiedCount: 12, pendingCount: 3 });

    expect(screen.getByTestId('analysis-kpi-classified').textContent).toMatch(/12/);
    expect(screen.getByTestId('analysis-kpi-pending').textContent).toMatch(/3/);
  });

  it('mostra botão Conferir apenas quando há pendentes', () => {
    render(AnalysisSummaryKpiCards, { classifiedCount: 5, pendingCount: 0 });
    expect(screen.queryByTestId('analysis-kpi-pending-review')).toBeNull();

    render(AnalysisSummaryKpiCards, { classifiedCount: 5, pendingCount: 2 });
    expect(screen.getByTestId('analysis-kpi-pending-review').textContent).toMatch(/Conferir/);
  });

  it('dispara onReviewPending ao clicar em Conferir', async () => {
    const onReviewPending = vi.fn();
    render(AnalysisSummaryKpiCards, {
      classifiedCount: 5,
      pendingCount: 1,
      onReviewPending
    });
    await fireEvent.click(screen.getByTestId('analysis-kpi-pending-review'));
    expect(onReviewPending).toHaveBeenCalledTimes(1);
  });
});
