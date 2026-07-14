import { render } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import ConsolidadaFilterTotalCard from './ConsolidadaFilterTotalCard.svelte';

describe('ConsolidadaFilterTotalCard', () => {
  it('renderiza título e ícone', () => {
    const { getByText, getByTestId } = render(ConsolidadaFilterTotalCard, {
      props: {
        title: 'Total aplicado (filtro atual)',
        lucideIcon: 'Banknote',
        testId: 'total-invested'
      }
    });
    expect(getByText('Total aplicado (filtro atual)')).toBeTruthy();
    expect(getByTestId('total-invested')).toBeTruthy();
    expect(getByTestId('lucide-icon-Banknote')).toBeTruthy();
  });

  it('usa ícone de queda para lucro negativo', () => {
    const { getByTestId } = render(ConsolidadaFilterTotalCard, {
      props: {
        title: 'Lucro (filtro atual)',
        lucideIcon: 'TrendingDown',
        borderClass: 'border-error/40',
        gradientClass: 'from-error/20',
        titleClass: 'text-error',
        iconBgClass: 'bg-error/15',
        iconFgClass: 'text-error'
      }
    });
    expect(getByTestId('lucide-icon-TrendingDown')).toBeTruthy();
  });
});
