import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { AssetPartition } from '$lib/api/objetivos';
import type { Position } from '$lib/api/portfolios';

import {
  computeDashboardPatrimonyFilterAvailability,
  isPensionAsset,
  resolvePositionCurrentBrlForDashboard,
  resolvePositionInvestedBrlForDashboard,
  sanitizeDashboardPatrimonyFilters
} from './dashboardPatrimonyScope';

const stockAsset: Asset = {
  id: 1,
  symbol: 'BBSE3',
  name: 'BB Seguridade',
  asset_type: 'stock',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'stocks',
  current_quote: 35
};

const pensionAsset: Asset = {
  ...stockAsset,
  id: 2,
  symbol: 'PREV-1',
  name: 'Previdência',
  asset_type: 'pension',
  display_class: 'pension',
  current_quote: null
};

const stockPosition: Position = {
  id: 1,
  portfolio_id: 1,
  asset_id: 1,
  quantity: 100,
  average_price: 30,
  status: 'active',
  created_at: '',
  updated_at: ''
};

const pensionPosition: Position = {
  ...stockPosition,
  id: 2,
  asset_id: 2,
  quantity: 0,
  average_price: 0,
  invested_amount: 20_000,
  current_value: 25_000
};

const partitionedAsset: Asset = {
  ...stockAsset,
  id: 3,
  symbol: 'AUPO11',
  asset_type: 'etf',
  display_class: 'fixed_income',
  current_quote: 100
};

const partitionedPosition: Position = {
  ...stockPosition,
  id: 3,
  asset_id: 3,
  quantity: 100,
  average_price: 80
};

const partition: AssetPartition = {
  asset_id: 3,
  symbol: 'AUPO11',
  name: 'AUPO11',
  split_mode: 'shares',
  position_total: 100,
  free: 0,
  position_current_value_brl: 10_000,
  position_invested_value_brl: 8_000,
  position_profit_brl: 2_000,
  slices: [
    {
      objective_id: 2,
      objective_name: 'AUPO11',
      slice_name: 'Investimento',
      is_default: false,
      exclude_from_rebalance: false,
      is_emergency_reserve: false,
      quantity: 60,
      amount: null,
      current_value_brl: 6_000,
      invested_value_brl: 4_800,
      profit_brl: 1_200
    },
    {
      objective_id: 2,
      objective_name: 'AUPO11',
      slice_name: 'Celular',
      is_default: false,
      exclude_from_rebalance: true,
      is_emergency_reserve: false,
      quantity: 40,
      amount: null,
      current_value_brl: 4_000,
      invested_value_brl: 3_200,
      profit_brl: 800
    }
  ]
};

describe('dashboardPatrimonyScope', () => {
  it('identifica previdência por tipo ou classe', () => {
    expect(isPensionAsset(pensionAsset)).toBe(true);
    expect(isPensionAsset(stockAsset)).toBe(false);
  });

  it('exclui previdência por padrão e inclui quando marcado', () => {
    expect(
      resolvePositionCurrentBrlForDashboard(pensionPosition, pensionAsset, null, undefined)
    ).toBe(0);
    expect(
      resolvePositionCurrentBrlForDashboard(pensionPosition, pensionAsset, null, undefined, {
        includeNonInvestment: false,
        includePension: true
      })
    ).toBe(25_000);
  });

  it('exclui fatias não-investimento de objetivos particionados', () => {
    expect(
      resolvePositionCurrentBrlForDashboard(
        partitionedPosition,
        partitionedAsset,
        null,
        partition
      )
    ).toBe(6_000);
    expect(
      resolvePositionCurrentBrlForDashboard(
        partitionedPosition,
        partitionedAsset,
        null,
        partition,
        { includeNonInvestment: true, includePension: false }
      )
    ).toBe(10_000);
  });

  it('aplica a mesma proporção no valor investido', () => {
    expect(
      resolvePositionInvestedBrlForDashboard(
        partitionedPosition,
        partitionedAsset,
        null,
        partition
      )
    ).toBeCloseTo(4_800);
  });

  it('detecta disponibilidade dos filtros por carteira', () => {
    expect(
      computeDashboardPatrimonyFilterAvailability(
        [pensionPosition, partitionedPosition],
        { 2: pensionAsset, 3: partitionedAsset },
        { 3: partition }
      )
    ).toEqual({ hasNonInvestment: true, hasPension: true });

    expect(
      computeDashboardPatrimonyFilterAvailability([stockPosition], { 1: stockAsset }, {})
    ).toEqual({ hasNonInvestment: false, hasPension: false });
  });

  it('sanitiza filtros quando a carteira nao possui as opcoes', () => {
    expect(
      sanitizeDashboardPatrimonyFilters(
        { includeNonInvestment: true, includePension: true },
        { hasNonInvestment: false, hasPension: true }
      )
    ).toEqual({ includeNonInvestment: false, includePension: true });
  });
});
