import { describe, expect, it } from 'vitest';

import type { Asset } from '$lib/api/assets';
import type { Position } from '$lib/api/portfolios';

import {
  computePortfolioSummary,
  computePositionProfit,
  formatPositionProfit,
  formatQuantityForDisplay,
  positionCurrentValue,
  positionInvestedValue,
  usesManualPositionValues,
  shouldShowNativeCurrencyHint,
  valueInBrl
} from './positionMetrics';

const stockAsset: Asset = {
  id: 1,
  symbol: 'VOO',
  name: 'Vanguard S&P 500 ETF',
  asset_type: 'etf',
  market: 'international',
  country: 'US',
  currency: 'USD',
  display_class: 'international',
  current_quote: 602.25
};

const fixedIncomeAsset: Asset = {
  id: 2,
  symbol: 'CDB BTG',
  name: 'CDB',
  asset_type: 'fixed_income',
  market: 'national',
  country: 'BR',
  currency: 'BRL',
  display_class: 'fixed_income'
};

const stockPosition: Position = {
  id: 1,
  portfolio_id: 1,
  asset_id: 1,
  quantity: 1.88637,
  average_price: 580.5,
  status: 'active',
  created_at: '',
  updated_at: ''
};

const manualPosition: Position = {
  id: 2,
  portfolio_id: 1,
  asset_id: 2,
  quantity: 0,
  average_price: 0,
  invested_amount: 1000,
  current_value: 1069.02,
  contracted_yield: 'IPCA+8,40%',
  status: 'active',
  created_at: '',
  updated_at: ''
};

describe('positionMetrics', () => {
  it('formata quantidade fracionária em notação BR', () => {
    expect(formatQuantityForDisplay(1.88637)).toBe('1,88637');
    expect(formatQuantityForDisplay(90)).toBe('90');
  });

  it('calcula valor aplicado e atual para ativos cotados', () => {
    expect(positionInvestedValue(stockPosition, stockAsset)).toBeCloseTo(1095.037785, 4);
    expect(positionCurrentValue(stockPosition, stockAsset)).toBeCloseTo(1136.0663325, 4);
  });

  it('calcula lucro para ações/ETF e renda fixa manual', () => {
    const stockProfit = computePositionProfit(stockPosition, stockAsset);
    expect(stockProfit?.profit).toBeCloseTo(41.0285475, 4);

    const manualProfit = computePositionProfit(manualPosition, fixedIncomeAsset);
    expect(manualProfit?.profit).toBeCloseTo(69.02, 2);
    expect(formatPositionProfit(manualPosition, fixedIncomeAsset)).toContain('69,02');
  });

  it('retorna lucro vazio sem cotação', () => {
    const noQuote = { ...stockAsset, current_quote: null };
    expect(formatPositionProfit(stockPosition, noQuote)).toBe('—');
  });

  it('agrega resumo por tipo e por moeda', () => {
    const summary = computePortfolioSummary(
      [stockPosition, manualPosition],
      { 1: stockAsset, 2: fixedIncomeAsset }
    );

    expect(summary.countByType).toEqual(
      expect.arrayContaining([
        { type: 'etf', label: 'ETF', count: 1 },
        { type: 'fixed_income', label: 'Renda fixa', count: 1 }
      ])
    );
    expect(summary.totalsByCurrency).toHaveLength(2);
    const brl = summary.totalsByCurrency.find((t) => t.currency === 'BRL');
    expect(brl?.invested).toBe(1000);
    expect(brl?.current).toBe(1069.02);
  });

  it('identifica renda fixa e previdência como manual', () => {
    expect(usesManualPositionValues(fixedIncomeAsset)).toBe(true);
    expect(usesManualPositionValues(stockAsset)).toBe(false);
  });

  it('converte valor para BRL apenas quando aplicável', () => {
    expect(valueInBrl(100, 'BRL', null)).toBe(100);
    expect(valueInBrl(10, 'USD', 5.5)).toBe(55);
    expect(valueInBrl(10, 'USD', null)).toBe(null);
    expect(valueInBrl(10, 'EUR', 5.5)).toBe(null);
    expect(valueInBrl(null, 'USD', 5.5)).toBe(null);
  });

  it('exibe dica de moeda original para posições em USD com valor', () => {
    expect(shouldShowNativeCurrencyHint(stockAsset, 100)).toBe(true);
    expect(shouldShowNativeCurrencyHint(stockAsset, null)).toBe(false);
    expect(shouldShowNativeCurrencyHint(fixedIncomeAsset, 100)).toBe(false);
  });
});
