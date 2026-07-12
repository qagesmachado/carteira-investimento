import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';

import {
  allocationToPieSegments,
  buildAssetMonthlyDividendAmounts,
  formatProfitPercentWithNominal,
  pieSlicePath,
  donutSlicePath,
  donutSegmentLabelPoint,
  shouldShowDonutSegmentLabel,
  sparklinePolyline,
  sparklinePointsFromAmounts,
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

describe('topAssetsByProfitPercent', () => {
  it('ordena por maior percentual de lucro', () => {
    const assets = { 1: brAsset, 2: usAsset };
    const rows = topAssetsByProfitPercent(
      [smallProfitPosition, bigProfitPosition],
      assets,
      5
    );

    expect(rows[0].symbol).toBe('BBSE3');
    expect(rows[0].typeLabel).toBeTruthy();
    expect(rows[0].profitPercent).toBeCloseTo(((40 - 30) / 30) * 100);
    expect(rows[1].symbol).toBe('VOO');
  });

  it('ignora posicoes sem lucro', () => {
    const lossAsset = { ...brAsset, current_quote: 20 };
    const rows = topAssetsByProfitPercent([smallProfitPosition], { 1: lossAsset }, 5);
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

  it('buildAssetMonthlyDividendAmounts agrega por mes', () => {
    const ref = new Date(2025, 5, 15);
    const amounts = buildAssetMonthlyDividendAmounts(
      [
        {
          id: 1,
          asset_id: 1,
          symbol: 'PETR4',
          payment_date: '2025-06-10',
          amount: 50,
          currency: 'BRL',
          display_class: 'stocks',
          payment_type: 'dividend',
          portfolio_id: 1,
          created_at: '',
          updated_at: ''
        }
      ],
      1,
      ref
    );
    expect(amounts).toHaveLength(12);
    expect(amounts[11]).toBe(50);
  });

  it('sparklinePointsFromAmounts gera pontos normalizados', () => {
    const points = sparklinePointsFromAmounts([0, 50, 100], 100, 20);
    expect(points).toHaveLength(3);
    expect(points[2].y).toBeLessThan(points[0].y);
  });

  it('sparklinePolyline monta string de pontos', () => {
    const poly = sparklinePolyline([
      { x: 0, y: 10 },
      { x: 5, y: 5 }
    ]);
    expect(poly).toBe('0,10 5,5');
  });
});
