import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';

import { filterAssets } from './filterAssets';

const sample: Asset[] = [
  {
    id: 1,
    symbol: 'EGIE3.SA',
    name: 'Engie Brasil Energia S.A.',
    asset_type: 'stock',
    market: 'national',
    currency: 'BRL',
    display_class: 'stocks'
  },
  {
    id: 2,
    symbol: 'PETR4',
    name: 'Petrobras PN',
    asset_type: 'stock',
    market: 'national',
    currency: 'BRL',
    display_class: 'stocks'
  }
];

describe('filterAssets', () => {
  it('retorna todos quando query vazia', () => {
    expect(filterAssets(sample, '')).toHaveLength(2);
    expect(filterAssets(sample, '   ')).toHaveLength(2);
  });

  it('filtra por ticker com ou sem .SA', () => {
    expect(filterAssets(sample, 'egie')).toHaveLength(1);
    expect(filterAssets(sample, 'EGIE3')[0].symbol).toBe('EGIE3.SA');
  });

  it('filtra por nome', () => {
    expect(filterAssets(sample, 'petrobras')).toHaveLength(1);
    expect(filterAssets(sample, 'Engie')).toHaveLength(1);
  });

  it('retorna vazio quando nada corresponde', () => {
    expect(filterAssets(sample, 'xyz')).toHaveLength(0);
  });
});
