import { describe, expect, it } from 'vitest';

import type { AssetDivergence, Objective } from '$lib/api/objetivos';

import { explicitOthersForDraft } from './allocationCapacity';
import { validateAllocationDraft } from './validateAllocations';

const divergences: AssetDivergence[] = [
  {
    asset_id: 11,
    symbol: 'AUPO11',
    name: 'AUPO11',
    split_mode: 'shares',
    total: 233,
    allocated_explicit: 184,
    free: 49,
    delta: 49,
    status: 'ok'
  }
];

const objective: Objective = {
  id: 1,
  name: 'Mono',
  mode: 'single_asset',
  partition_asset_id: 11,
  is_default: false,
  allocations: [
    {
      id: 99,
      slice_name: 'Investimento',
      asset_id: 11,
      symbol: 'AUPO11',
      split_mode: 'shares',
      quantity: 184,
      amount: null
    }
  ]
} as Objective;

describe('explicitOthersForDraft', () => {
  it('na edição não duplica a fatia atual (184 + 184)', () => {
    const others = explicitOthersForDraft(divergences, objective, 11, 99);
    expect(others).toBe(0);

    const validation = validateAllocationDraft('shares', 233, others, 184);
    expect(validation.ok).toBe(true);
  });

  it('na nova fatia soma o já alocado globalmente', () => {
    const others = explicitOthersForDraft(divergences, objective, 11, null);
    expect(others).toBe(184);

    const validation = validateAllocationDraft('shares', 233, others, 15);
    expect(validation.ok).toBe(true);
    if (validation.ok) {
      expect(validation.free).toBe(34);
    }
  });

  it('na edição com outra fatia no mesmo objetivo desconta só a linha editada', () => {
    const multiSlice: Objective = {
      ...objective,
      allocations: [
        {
          id: 1,
          slice_name: 'Viagem',
          asset_id: 11,
          symbol: 'AUPO11',
          split_mode: 'shares',
          quantity: 10,
          amount: null
        },
        {
          id: 2,
          slice_name: 'Reserva',
          asset_id: 11,
          symbol: 'AUPO11',
          split_mode: 'shares',
          quantity: 174,
          amount: null
        }
      ]
    } as Objective;

    const others = explicitOthersForDraft(divergences, multiSlice, 11, 2);
    expect(others).toBe(10);

    const validation = validateAllocationDraft('shares', 233, others, 100);
    expect(validation.ok).toBe(true);
  });
});
