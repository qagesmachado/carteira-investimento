import { describe, expect, it } from 'vitest';

import type { Asset, DisplayClass } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';

import {
  computeAllocationByDisplayClass,
  computeDashboardPatrimony,
  computeGrossReturnByDisplayClass,
  formatGrossReturnPercent,
  pickTopGrossReturnClasses
} from './portfolioDashboard';
import type { AssetPartition } from '$lib/api/objetivos';

const brAsset: Asset = {
  id: 1,
  symbol: 'BBSE3',
  name: 'BB Seguridade',
  asset_type: 'stock',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'stocks'
};

const usAsset: Asset = {
  ...brAsset,
  id: 2,
  symbol: 'VOO',
  name: 'Vanguard',
  asset_type: 'etf',
  market: 'international',
  country: 'US',
  currency: 'USD',
  display_class: 'international',
  current_quote: 400
};

const brPosition: Position = {
  id: 1,
  portfolio_id: 1,
  asset_id: 1,
  quantity: 100,
  average_price: 30,
  status: 'active',
  created_at: '',
  updated_at: ''
};

const usPosition: Position = {
  id: 2,
  portfolio_id: 1,
  asset_id: 2,
  quantity: 10,
  average_price: 350,
  status: 'active',
  created_at: '',
  updated_at: ''
};

describe('computeDashboardPatrimony', () => {
  it('agrega patrimonio em BRL com conversao USD', () => {
    const assets = { 1: { ...brAsset, current_quote: 35 }, 2: usAsset };
    const result = computeDashboardPatrimony([brPosition, usPosition], assets, 5);

    expect(result.investedBrl).toBeCloseTo(100 * 30 + 10 * 350 * 5);
    expect(result.currentBrl).toBeCloseTo(100 * 35 + 10 * 400 * 5);
    expect(result.profitBrl).toBeCloseTo(result.currentBrl - result.investedBrl);
    expect(result.activePositions).toBe(2);
  });

  it('ignora posicao sem ativo resolvido', () => {
    const result = computeDashboardPatrimony(
      [{ ...brPosition, asset_id: 999 }],
      { 1: { ...brAsset, current_quote: 35 } },
      null
    );
    expect(result.activePositions).toBe(0);
    expect(result.currentBrl).toBe(0);
  });

  it('conta posicao com ativo mesmo sem cotação', () => {
    const result = computeDashboardPatrimony([brPosition], { 1: brAsset }, null);
    expect(result.activePositions).toBe(1);
    expect(result.currentBrl).toBe(0);
  });

  it('exclui previdência e fatias não-investimento por padrão', () => {
    const pensionAsset: Asset = {
      ...brAsset,
      id: 3,
      asset_type: 'pension',
      display_class: 'pension'
    };
    const pensionPosition: Position = {
      ...brPosition,
      id: 3,
      asset_id: 3,
      invested_amount: 10_000,
      current_value: 12_000
    };
    const partition: AssetPartition = {
      asset_id: 1,
      symbol: 'BBSE3',
      name: 'BB',
      split_mode: 'shares',
      position_total: 100,
      free: 40,
      position_current_value_brl: 3_500,
      position_invested_value_brl: 3_000,
      position_profit_brl: 500,
      slices: [
        {
          objective_id: 2,
          objective_name: 'Obj',
          slice_name: 'Reserva',
          is_default: false,
          exclude_from_rebalance: true,
          is_emergency_reserve: false,
          quantity: 40,
          amount: null,
          current_value_brl: 1_400,
          invested_value_brl: 1_200,
          profit_brl: 200
        }
      ]
    };

    const assets = { 1: { ...brAsset, current_quote: 35 }, 3: pensionAsset };
    const result = computeDashboardPatrimony(
      [brPosition, pensionPosition],
      assets,
      null,
      { 1: partition }
    );

    expect(result.currentBrl).toBeCloseTo(2_100);
    expect(result.activePositions).toBe(1);
  });

  it('inclui previdência no contador quando filtro marcado', () => {
    const pensionAsset: Asset = {
      ...brAsset,
      id: 3,
      asset_type: 'pension',
      display_class: 'pension'
    };
    const pensionPosition: Position = {
      ...brPosition,
      id: 3,
      asset_id: 3,
      invested_amount: 10_000,
      current_value: 12_000
    };

    const withoutPension = computeDashboardPatrimony(
      [brPosition, pensionPosition],
      { 1: { ...brAsset, current_quote: 35 }, 3: pensionAsset },
      null,
      {},
      { includeNonInvestment: false, includePension: false }
    );
    const withPension = computeDashboardPatrimony(
      [brPosition, pensionPosition],
      { 1: { ...brAsset, current_quote: 35 }, 3: pensionAsset },
      null,
      {},
      { includeNonInvestment: false, includePension: true }
    );

    expect(withoutPension.activePositions).toBe(1);
    expect(withPension.activePositions).toBe(2);
  });
});

describe('computeAllocationByDisplayClass', () => {
  it('distribui percentuais por display_class', () => {
    const assets = { 1: { ...brAsset, current_quote: 35 }, 2: usAsset };
    const rows = computeAllocationByDisplayClass([brPosition, usPosition], assets, 5);

    expect(rows).toHaveLength(2);
    const byClass = Object.fromEntries(rows.map((r) => [r.displayClass, r])) as Record<
      DisplayClass,
      (typeof rows)[0]
    >;
    expect(byClass.stocks.valueBrl).toBeCloseTo(3500);
    expect(byClass.international.valueBrl).toBeCloseTo(20000);
    const total = rows.reduce((s, r) => s + r.valueBrl, 0);
    expect(byClass.stocks.percent).toBeCloseTo((3500 / total) * 100);
  });

  it('retorna lista vazia sem valor atual', () => {
    const assets = { 1: brAsset };
    const rows = computeAllocationByDisplayClass([brPosition], assets, null);
    expect(rows).toHaveLength(0);
  });
});

describe('computeGrossReturnByDisplayClass', () => {
  it('ordena classes por rendimento bruto percentual', () => {
    const assets = { 1: { ...brAsset, current_quote: 33 }, 2: usAsset };
    const rows = computeGrossReturnByDisplayClass([brPosition, usPosition], assets, 5);

    expect(rows).toHaveLength(2);
    expect(rows[0].displayClass).toBe('international');
    expect(rows[0].profitPercent).toBeCloseTo(14.285714, 2);
    expect(rows[1].displayClass).toBe('stocks');
    expect(rows[1].profitPercent).toBeCloseTo(10, 2);
  });

  it('retorna lista vazia sem valor investido calculável', () => {
    const assets = { 1: brAsset };
    const rows = computeGrossReturnByDisplayClass([brPosition], assets, null);
    expect(rows).toHaveLength(0);
  });
});

describe('pickTopGrossReturnClasses', () => {
  it('limita ao top 3', () => {
    const rows = pickTopGrossReturnClasses(
      [
        {
          displayClass: 'international',
          label: 'Internacional',
          investedBrl: 100,
          currentBrl: 150,
          profitBrl: 50,
          profitPercent: 50
        },
        {
          displayClass: 'stocks',
          label: 'Ações',
          investedBrl: 100,
          currentBrl: 110,
          profitBrl: 10,
          profitPercent: 10
        },
        {
          displayClass: 'funds',
          label: 'FII',
          investedBrl: 100,
          currentBrl: 105,
          profitBrl: 5,
          profitPercent: 5
        },
        {
          displayClass: 'fixed_income',
          label: 'Renda fixa',
          investedBrl: 100,
          currentBrl: 101,
          profitBrl: 1,
          profitPercent: 1
        }
      ],
      3
    );

    expect(rows).toHaveLength(3);
    expect(rows.map((row) => row.displayClass)).toEqual(['international', 'stocks', 'funds']);
  });
});

describe('formatGrossReturnPercent', () => {
  it('formata com sinal e vírgula pt-BR', () => {
    expect(formatGrossReturnPercent(12.34)).toBe('+12,3%');
    expect(formatGrossReturnPercent(-4.5)).toBe('-4,5%');
  });
});
