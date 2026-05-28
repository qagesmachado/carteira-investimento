import { render, fireEvent } from '@testing-library/svelte';
import { describe, expect, it } from 'vitest';

import AssetAllocationModal from './AssetAllocationModal.svelte';

const assets = [
  {
    id: 1,
    symbol: 'PETR4',
    name: 'Petrobras',
    asset_type: 'stock',
    market: 'national',
    country: 'BR',
    currency: 'BRL',
    current_quote: 10
  }
];

const divergencesOk = [
  {
    asset_id: 1,
    symbol: 'PETR4',
    name: 'Petrobras',
    split_mode: 'shares' as const,
    total: 100,
    allocated_explicit: 0,
    free: 100,
    delta: 0,
    status: 'ok' as const
  }
];

const singleObjective = {
  id: 3,
  portfolio_id: 1,
  name: 'Caixinhas',
  description: null,
  is_default: false,
  mode: 'single_asset' as const,
  partition_asset_id: 1,
  allocations: [],
  total_value_brl: 0
};

describe('AssetAllocationModal', () => {
  it('monoativo exige nome interno e permite nova fatia', async () => {
    render(AssetAllocationModal, {
      props: {
        open: true,
        assets,
        objective: singleObjective,
        divergences: divergencesOk
      }
    });

    expect(document.querySelector('.asset-picker')).toBeNull();
    expect(document.querySelector('[data-testid="allocation-partition-asset-label"]')).toBeTruthy();
    expect(document.querySelector('[data-testid="allocation-slice-name-input"]')).toBeTruthy();
    const nameInput = document.querySelector(
      '[data-testid="allocation-slice-name-input"]'
    ) as HTMLInputElement;
    await fireEvent.input(nameInput, { target: { value: 'Viagem' } });
    const shares = document.querySelector(
      '[data-testid="allocation-shares-input"]'
    ) as HTMLInputElement;
    await fireEvent.input(shares, { target: { value: '10' } });

    const saveBtn = document.querySelector('[data-testid="allocation-save-btn"]') as HTMLButtonElement;
    expect(saveBtn.disabled).toBe(false);
  });

  it('limpa campos ao reabrir para nova fatia', async () => {
    const { rerender } = render(AssetAllocationModal, {
      props: {
        open: true,
        sessionKey: 1,
        assets,
        objective: singleObjective,
        divergences: divergencesOk
      }
    });

    const nameInput = document.querySelector(
      '[data-testid="allocation-slice-name-input"]'
    ) as HTMLInputElement;
    const shares = document.querySelector(
      '[data-testid="allocation-shares-input"]'
    ) as HTMLInputElement;
    await fireEvent.input(nameInput, { target: { value: 'Investimento' } });
    await fireEvent.input(shares, { target: { value: '10' } });
    expect(nameInput.value).toBe('Investimento');
    expect(shares.value).toBe('10');

    await rerender({
      open: false,
      sessionKey: 1,
      assets,
      objective: singleObjective,
      divergences: divergencesOk
    });
    await rerender({
      open: true,
      sessionKey: 2,
      assets,
      objective: singleObjective,
      divergences: divergencesOk
    });

    const nameAgain = document.querySelector(
      '[data-testid="allocation-slice-name-input"]'
    ) as HTMLInputElement;
    const sharesAgain = document.querySelector(
      '[data-testid="allocation-shares-input"]'
    ) as HTMLInputElement;
    expect(nameAgain.value).toBe('');
    expect(sharesAgain.value).toBe('');
  });

  it('preenche campos ao editar fatia existente', () => {
    const objectiveWithSlice = {
      ...singleObjective,
      allocations: [
        {
          id: 42,
          slice_name: 'Investr',
          asset_id: 1,
          symbol: 'PETR4',
          name: 'Petrobras',
          asset_type: 'stock',
          quantity: 10,
          amount: null,
          split_mode: 'shares' as const,
          current_value_brl: 100,
          invested_value_brl: 95,
          profit_brl: 5,
          profit_percent: 5.26
        }
      ]
    };

    render(AssetAllocationModal, {
      props: {
        open: true,
        sessionKey: 1,
        editingAllocationId: 42,
        assets,
        objective: objectiveWithSlice,
        divergences: [
          {
            ...divergencesOk[0],
            allocated_explicit: 10,
            free: 90
          }
        ]
      }
    });

    const nameInput = document.querySelector(
      '[data-testid="allocation-slice-name-input"]'
    ) as HTMLInputElement;
    const shares = document.querySelector(
      '[data-testid="allocation-shares-input"]'
    ) as HTMLInputElement;
    expect(nameInput.value).toBe('Investr');
    expect(shares.value).toBe('10');
  });

});
