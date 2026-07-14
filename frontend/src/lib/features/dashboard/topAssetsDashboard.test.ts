import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';

import {
  allocationToPieSegments,
  formatProfitPercentWithNominal,
  pieSlicePath,
  donutSlicePath,
  donutSegmentLabelPoint,
  shouldShowDonutSegmentLabel,
  TOP_ASSETS_PANEL_LIMIT,
  topAssetsByGrossProfit,
  topAssetsByPositionValue,
  topAssetsByProfitPercent
} from './topAssetsDashboard';

const brAsset: Asset = {
  id: 1,
  symbol: 'BBSE3',
  name: 'BB Seguridade',
  asset_type: 'stock',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'stocks',
  current_quote: 40
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
  current_quote: 500
};

const smallProfitPosition: Position = {
  id: 1,
  portfolio_id: 1,
  asset_id: 1,
  quantity: 100,
  average_price: 30,
  status: 'active',
  created_at: '',
  updated_at: ''
};

const bigProfitPosition: Position = {
  id: 2,
  portfolio_id: 1,
  asset_id: 2,
  quantity: 10,
  average_price: 400,
  status: 'active',
  created_at: '',
  updated_at: ''
};

describe('formatProfitPercentWithNominal', () => {
  it('inclui percentual e valor nominal entre parenteses', () => {
    const formatted = formatProfitPercentWithNominal(33.6, 1500, 'BRL');
    expect(formatted).toContain('33,6%');
    expect(formatted).toContain('(R$');
    expect(formatted).toContain('1.500,00');
  });
});

describe('TOP_ASSETS_PANEL_LIMIT', () => {
  it('limita o painel a 3 ativos', () => {
    expect(TOP_ASSETS_PANEL_LIMIT).toBe(3);
  });
});

describe('topAssetsByProfitPercent', () => {
  it('ordena por maior percentual de lucro', () => {
    const assets = { 1: brAsset, 2: usAsset };
    const rows = topAssetsByProfitPercent(
      [smallProfitPosition, bigProfitPosition],
      assets,
      5,
      { usdBrlRate: 5 }
    );

    expect(rows[0].symbol).toBe('BBSE3');
    expect(rows[0].typeLabel).toBeTruthy();
    expect(rows[0].displayClass).toBe('stocks');
    expect(rows[0].profitPercent).toBeCloseTo(((40 - 30) / 30) * 100);
    expect(rows[1].symbol).toBe('VOO');
  });

  it('ignora posicoes sem lucro', () => {
    const lossAsset = { ...brAsset, current_quote: 20 };
    const rows = topAssetsByProfitPercent([smallProfitPosition], { 1: lossAsset }, 5, { usdBrlRate: 5 });
    expect(rows).toHaveLength(0);
  });
});

describe('topAssetsByPositionValue', () => {
  it('ordena por valor de mercado em BRL', () => {
    const assets = { 1: brAsset, 2: usAsset };
    const rows = topAssetsByPositionValue(
      [smallProfitPosition, bigProfitPosition],
      assets,
      5,
      5
    );

    expect(rows[0].symbol).toBe('VOO');
    expect(rows[0].displayClass).toBe('international');
    expect(rows[0].displayAmount).toBeCloseTo(5000);
    expect(rows[1].symbol).toBe('BBSE3');
  });
});

describe('topAssetsByGrossProfit', () => {
  it('ordena por lucro nominal na moeda do ativo', () => {
    const assets = { 1: brAsset, 2: usAsset };
    const rows = topAssetsByGrossProfit(
      [smallProfitPosition, bigProfitPosition],
      assets,
      5,
      5
    );

    expect(rows[0].symbol).toBe('VOO');
    expect(rows[0].displayAmount).toBeCloseTo(1000);
    expect(rows[1].symbol).toBe('BBSE3');
    expect(rows[1].displayAmount).toBeCloseTo(1000);
  });

  it('exclui previdencia quando filtro desmarcado', () => {
    const pensionAsset: Asset = {
      ...brAsset,
      id: 3,
      symbol: 'PREV-1',
      name: 'Previdência',
      asset_type: 'pension',
      display_class: 'pension',
      current_quote: null
    };
    const pensionPosition: Position = {
      ...smallProfitPosition,
      id: 3,
      asset_id: 3,
      quantity: 0,
      average_price: 0,
      invested_amount: 20_000,
      current_value: 25_000
    };
    const assets = { 1: brAsset, 3: pensionAsset };
    const rows = topAssetsByGrossProfit(
      [smallProfitPosition, pensionPosition],
      assets,
      null,
      5,
      { filters: { includeNonInvestment: false, includePension: false } }
    );
    expect(rows.every((row) => row.symbol !== 'PREV-1')).toBe(true);
  });
});

describe('allocationToPieSegments', () => {
  it('distribui angulos proporcionais ao percentual', () => {
    const segments = allocationToPieSegments([
      { displayClass: 'a', label: 'A', percent: 25, valueBrl: 250 },
      { displayClass: 'b', label: 'B', percent: 75, valueBrl: 750 }
    ]);

    expect(segments[0].startAngle).toBe(0);
    expect(segments[0].endAngle).toBeCloseTo(90);
    expect(segments[1].startAngle).toBeCloseTo(90);
    expect(segments[1].endAngle).toBeCloseTo(360);
  });

  it('usa indice de cor fixo por display_class', () => {
    const segments = allocationToPieSegments([
      { displayClass: 'crypto', label: 'Cripto', percent: 10, valueBrl: 100 },
      { displayClass: 'stocks', label: 'Ações', percent: 90, valueBrl: 900 }
    ]);

    expect(segments[0].colorIndex).toBe(5);
    expect(segments[1].colorIndex).toBe(1);
  });

  it('gera path SVG valido para fatia', () => {
    const path = pieSlicePath(0, 90);
    expect(path).toMatch(/^M /);
    expect(path).toContain('A');
  });

  it('gera path SVG valido para fatia de rosca', () => {
    const path = donutSlicePath(0, 90);
    expect(path).toMatch(/^M /);
    expect(path).toContain('A');
    expect(path.split('A').length).toBeGreaterThan(2);
  });

  it('shouldShowDonutSegmentLabel exige percentual e angulo minimos', () => {
    expect(shouldShowDonutSegmentLabel(42, 151.2)).toBe(true);
    expect(shouldShowDonutSegmentLabel(4.7, 16.9)).toBe(true);
    expect(shouldShowDonutSegmentLabel(3.9, 14)).toBe(false);
    expect(shouldShowDonutSegmentLabel(10, 10)).toBe(false);
  });
});
