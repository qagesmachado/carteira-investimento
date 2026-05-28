import { describe, expect, it } from 'vitest';

import { hasDuplicateSliceName } from './sliceNameValidation';

const allocations = [
  { id: 1, slice_name: 'Celular' },
  { id: 2, slice_name: 'Investimento' },
  { id: 3, slice_name: 'Reserva' }
];

describe('hasDuplicateSliceName', () => {
  it('permite manter o mesmo nome na edição', () => {
    expect(hasDuplicateSliceName(allocations, 'Investimento', 2)).toBe(false);
  });

  it('bloqueia renomear para nome de outra fatia', () => {
    expect(hasDuplicateSliceName(allocations, 'Celular', 2)).toBe(true);
  });

  it('bloqueia nova fatia com nome já usado', () => {
    expect(hasDuplicateSliceName(allocations, 'Reserva', null)).toBe(true);
  });

  it('aceita nome novo na criação', () => {
    expect(hasDuplicateSliceName(allocations, 'Viagem', null)).toBe(false);
  });
});
