import { describe, expect, it } from 'vitest';

import type { Portfolio } from '$lib/api/portfolios';

import { resolveActivePortfolioId } from './resolveActivePortfolioId';

const portfolios: Portfolio[] = [
  { id: 1, name: 'Carteira A', allocation_targets_json: null, created_at: '', updated_at: '' },
  { id: 2, name: 'Carteira B', allocation_targets_json: null, created_at: '', updated_at: '' }
];

describe('resolveActivePortfolioId', () => {
  it('retorna id global quando a carteira existe', () => {
    expect(resolveActivePortfolioId(2, portfolios)).toBe(2);
  });

  it('cai para a primeira carteira quando global é null', () => {
    expect(resolveActivePortfolioId(null, portfolios)).toBe(1);
  });

  it('cai para a primeira carteira quando global aponta para id inexistente', () => {
    expect(resolveActivePortfolioId(99, portfolios)).toBe(1);
  });

  it('retorna null quando não há carteiras', () => {
    expect(resolveActivePortfolioId(null, [])).toBeNull();
    expect(resolveActivePortfolioId(1, [])).toBeNull();
  });
});
