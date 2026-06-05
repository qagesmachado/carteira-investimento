import { afterEach, beforeEach, describe, expect, it } from 'vitest';

import type { AssetDivergence } from '$lib/api/objetivos';
import { setHideMoneyValues } from '$lib/stores/hideMoneyValues';

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
  beforeEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

  afterEach(() => {
    localStorage.clear();
    setHideMoneyValues(false);
  });

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

  it('mascara mensagem em modo valor quando ocultar valores está ativo', () => {
    const amountDivergence: AssetDivergence = {
      ...divergence,
      split_mode: 'amount',
      delta: -1500
    };
    setHideMoneyValues(true);
    expect(formatDivergenceMessage(amountDivergence)).toBe('R$ •••••• removidos');
  });
});
