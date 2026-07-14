import { describe, expect, it } from 'vitest';

import {
  buildConsolidadaFilterChips,
  clearAllConsolidadaFilters,
  clearConsolidadaFilterField,
  countActiveConsolidadaFilters,
  FILTER_DISPLAY_CLASS_NATIONAL,
  formatConsolidadaSortLabel,
  sanitizeConsolidadaPatrimonyFilters
} from './consolidadaFilterState';

describe('consolidadaFilterState', () => {
  const base = {
    filterText: '',
    filterAssetTypeStr: '',
    filterDisplayClassStr: '',
    filterCurrency: '',
    filterIncludeNonInvestment: false,
    filterIncludePension: false
  };

  it('conta filtros ativos', () => {
    expect(countActiveConsolidadaFilters(base)).toBe(0);
    expect(
      countActiveConsolidadaFilters({
        ...base,
        filterText: 'BBSE',
        filterIncludeNonInvestment: true
      })
    ).toBe(2);
  });

  it('monta chips removíveis', () => {
    const chips = buildConsolidadaFilterChips({
      ...base,
      filterDisplayClassStr: FILTER_DISPLAY_CLASS_NATIONAL,
      filterCurrency: 'USD'
    });
    expect(chips).toHaveLength(2);
    expect(chips[0]?.label).toBe('Classe: Nacional');
    expect(chips[1]?.label).toBe('Moeda: USD');
  });

  it('limpa campo individual e todos os filtros', () => {
    const active = {
      filterText: 'VOO',
      filterAssetTypeStr: 'etf',
      filterDisplayClassStr: '',
      filterCurrency: '',
      filterIncludeNonInvestment: true
    };
    expect(clearConsolidadaFilterField(active, 'text').filterText).toBe('');
    expect(clearAllConsolidadaFilters(active)).toEqual(base);
  });

  it('monta chip de previdência quando incluída', () => {
    const chips = buildConsolidadaFilterChips({
      ...base,
      filterIncludePension: true
    });
    expect(chips).toHaveLength(1);
    expect(chips[0]?.label).toBe('Previdência');
  });

  it('monta chip de não investimento quando incluído', () => {
    const chips = buildConsolidadaFilterChips({
      ...base,
      filterIncludeNonInvestment: true
    });
    expect(chips).toHaveLength(1);
    expect(chips[0]?.label).toBe('Ativos que não são investimento');
  });

  it('limpa chip de previdência', () => {
    expect(
      clearConsolidadaFilterField({ ...base, filterIncludePension: true }, 'include_pension')
        .filterIncludePension
    ).toBe(false);
  });

  it('limpa chip de não investimento', () => {
    expect(
      clearConsolidadaFilterField(
        { ...base, filterIncludeNonInvestment: true },
        'include_non_investment'
      ).filterIncludeNonInvestment
    ).toBe(false);
  });

  it('sanitiza filtros patrimoniais conforme disponibilidade', () => {
    expect(
      sanitizeConsolidadaPatrimonyFilters(
        { ...base, filterIncludeNonInvestment: true, filterIncludePension: true },
        { hasNonInvestment: false, hasPension: true }
      )
    ).toEqual({ ...base, filterIncludeNonInvestment: false, filterIncludePension: true });
  });

  it('formata rótulo de ordenação', () => {
    expect(formatConsolidadaSortLabel('ticker', 'asc')).toBe('Ticker ↑');
    expect(formatConsolidadaSortLabel('profit', 'desc')).toBe('Lucro ↓');
  });
});
