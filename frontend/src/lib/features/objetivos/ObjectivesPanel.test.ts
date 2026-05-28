import { render, fireEvent } from '@testing-library/svelte';
import { describe, expect, it, vi } from 'vitest';

import ObjectivesPanel from './ObjectivesPanel.svelte';
import { OBJECTIVES_SUMMARY_TAB_ID } from './constants';

const objectives = [
  {
    id: 1,
    portfolio_id: 1,
    name: 'Livre',
    description: null,
    is_default: true,
    mode: 'multi_asset' as const,
    partition_asset_id: null,
    allocations: [],
    total_value_brl: 1000
  },
  {
    id: 2,
    portfolio_id: 1,
    name: 'Reserva',
    description: null,
    is_default: false,
    mode: 'multi_asset' as const,
    partition_asset_id: null,
    allocations: [],
    total_value_brl: 500
  }
];

describe('ObjectivesPanel', () => {
  it('exibe aba Resumo', () => {
    render(ObjectivesPanel, {
      props: { objectives, selectedId: OBJECTIVES_SUMMARY_TAB_ID }
    });
    expect(document.querySelector('[data-testid="objetivo-tab-resumo"]')).toBeTruthy();
  });

  it('não exibe objetivo Livre nas abas', () => {
    render(ObjectivesPanel, {
      props: { objectives, selectedId: OBJECTIVES_SUMMARY_TAB_ID }
    });
    expect(document.querySelector('[data-testid="objetivo-card-1"]')).toBeNull();
    expect(document.querySelector('[data-testid="objetivo-card-2"]')).toBeTruthy();
  });

  it('emite select ao clicar em objetivo', async () => {
    const onSelect = vi.fn();
    const { component } = render(ObjectivesPanel, {
      props: { objectives, selectedId: 1 }
    });
    component.$on('select', onSelect);
    await fireEvent.click(document.querySelector('[data-testid="objetivo-card-2"]')!);
    expect(onSelect).toHaveBeenCalledOnce();
    expect(onSelect.mock.calls[0][0].detail).toBe(2);
  });

  it('emite create ao clicar em novo objetivo', async () => {
    const onCreate = vi.fn();
    const { component } = render(ObjectivesPanel, {
      props: { objectives, selectedId: 1 }
    });
    component.$on('create', onCreate);
    await fireEvent.click(document.querySelector('[data-testid="objetivo-create-btn"]')!);
    expect(onCreate).toHaveBeenCalledOnce();
  });
});
