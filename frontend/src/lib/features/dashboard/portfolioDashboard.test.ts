import { describe, expect, it } from 'vitest';

import type { Asset, DisplayClass } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';

import {
  computeAllocationByDisplayClass,
  computeDashboardPatrimony
} from './portfolioDashboard';

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

  it('calcula totais por moeda nativa', () => {
    const assets = { 1: { ...brAsset, current_quote: 35 }, 2: usAsset };
    const result = computeDashboardPatrimony([brPosition, usPosition], assets, 5);

    const brl = result.totalsByCurrency.find((t) => t.currency === 'BRL');
    const usd = result.totalsByCurrency.find((t) => t.currency === 'USD');
    expect(brl?.current).toBeCloseTo(3500);
    expect(usd?.current).toBeCloseTo(4000);
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
