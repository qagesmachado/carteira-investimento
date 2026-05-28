import { describe, expect, it } from 'vitest';

import { buildAllocationPayload, validateAllocationDraft } from './validateAllocations';

describe('validateAllocationDraft', () => {
  it('aceita alocação parcial com resto livre', () => {
    const result = validateAllocationDraft('shares', 100, 0, 60);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.free).toBe(40);
    }
  });

  it('rejeita soma acima do total', () => {
    const result = validateAllocationDraft('shares', 100, 60, 50);
    expect(result.ok).toBe(false);
  });
});

describe('buildAllocationPayload', () => {
  it('monta payload por cotas ou valor', () => {
    expect(buildAllocationPayload('shares', 'Viagem', 1, 10)).toEqual({
      slice_name: 'Viagem',
      asset_id: 1,
      quantity: 10
    });
    expect(buildAllocationPayload('amount', 'Reserva', 2, 5000)).toEqual({
      slice_name: 'Reserva',
      asset_id: 2,
      amount: 5000
    });
  });
});
