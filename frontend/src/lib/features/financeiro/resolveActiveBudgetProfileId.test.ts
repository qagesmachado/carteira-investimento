import { describe, expect, it } from 'vitest';

import type { BudgetProfile } from '$lib/api/budget';

import { resolveActiveBudgetProfileId } from './resolveActiveBudgetProfileId';

describe('resolveActiveBudgetProfileId', () => {
  const profiles: BudgetProfile[] = [
    { id: 1, name: 'A', description: null },
    { id: 2, name: 'B', description: null }
  ];

  it('mantém id armazenado quando existe na lista', () => {
    expect(resolveActiveBudgetProfileId(profiles, 2)).toBe(2);
  });

  it('cai no primeiro perfil quando armazenado é inválido', () => {
    expect(resolveActiveBudgetProfileId(profiles, 99)).toBe(1);
  });

  it('retorna null quando não há perfis', () => {
    expect(resolveActiveBudgetProfileId([], null)).toBeNull();
  });
});
