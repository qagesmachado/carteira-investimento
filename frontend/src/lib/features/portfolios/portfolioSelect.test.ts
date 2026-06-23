import { fireEvent, render, screen } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import PortfolioSelect from './PortfolioSelect.svelte';
import { readPortfolioIdFromSelectEvent } from './portfolioSelect';

describe('readPortfolioIdFromSelectEvent', () => {
  it('retorna id positivo a partir do select', () => {
    const select = document.createElement('select');
    select.innerHTML = '<option value="42">Carteira</option>';
    select.value = '42';

    const event = { currentTarget: select } as unknown as Event;
    expect(readPortfolioIdFromSelectEvent(event)).toBe(42);
  });

  it('retorna null para valor vazio ou inválido', () => {
    const select = document.createElement('select');
    select.value = '';

    const event = { currentTarget: select } as unknown as Event;
    expect(readPortfolioIdFromSelectEvent(event)).toBeNull();
  });
});

describe('PortfolioSelect', () => {
  const portfolios = [
    { id: 1, name: 'Carteira A', allocation_targets_json: null, created_at: '', updated_at: '' },
    { id: 2, name: 'Carteira B', allocation_targets_json: null, created_at: '', updated_at: '' }
  ];

  it('emite select ao trocar carteira', async () => {
    const onSelect = vi.fn();
    const { component } = render(PortfolioSelect, {
      props: { portfolios, activeId: 1 }
    });
    component.$on('select', onSelect);

    await fireEvent.change(screen.getByLabelText('Selecionar carteira'), {
      target: { value: '2' }
    });

    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect.mock.calls[0][0].detail).toBe(2);
  });

  it('não emite select quando valor não muda', async () => {
    const onSelect = vi.fn();
    const { component } = render(PortfolioSelect, {
      props: { portfolios, activeId: 1 }
    });
    component.$on('select', onSelect);

    await fireEvent.change(screen.getByLabelText('Selecionar carteira'), {
      target: { value: '1' }
    });

    expect(onSelect).not.toHaveBeenCalled();
  });

  it('aplica data-testid quando informado', () => {
    render(PortfolioSelect, {
      props: { portfolios, activeId: 1, testId: 'portfolio-select-header' }
    });

    expect(screen.getByTestId('portfolio-select-header').getAttribute('aria-label')).toBe(
      'Selecionar carteira'
    );
  });
});
