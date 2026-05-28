import { describe, expect, it } from 'vitest';

import type { AssetDivergence } from '$lib/api/objetivos';

import {
  explicitAllocatedForAsset,
  formatDivergenceMessage,
  isAssetBlocked
} from './computeDivergence';

const divergence: AssetDivergence = {
  asset_id: 1,
  symbol: 'PETR4',
  name: 'Petrobras',
  split_mode: 'shares',
  total: 50,
  allocated_explicit: 60,
  free: -10,
  delta: -10,
  status: 'over_total'
};

describe('computeDivergence helpers', () => {
  it('detecta bloqueio por over_total', () => {
    expect(isAssetBlocked([divergence], 1)).toBe(true);
    expect(isAssetBlocked([divergence], 2)).toBe(false);
  });

  it('formata mensagem de cotas removidas', () => {
    expect(formatDivergenceMessage(divergence)).toContain('removidas');
  });

  it('lê totais explícitos por ativo', () => {
    expect(explicitAllocatedForAsset([divergence], 1)).toBe(60);
  });
});
