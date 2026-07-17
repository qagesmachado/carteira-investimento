import { describe, expect, it } from 'vitest';

import {
  ANALYSIS_SECTION_TABS,
  analysisSectionTabHref,
  resolveAnalysisSectionTab
} from './analysisSectionTabs';

describe('analysisSectionTabs utils', () => {
  it('lista Sumário como primeira aba', () => {
    expect(ANALYSIS_SECTION_TABS[0]?.id).toBe('sumario');
    expect(ANALYSIS_SECTION_TABS[0]?.label).toBe('Sumário');
    expect(ANALYSIS_SECTION_TABS).toHaveLength(5);
  });

  it('resolve aba ativa por pathname', () => {
    expect(resolveAnalysisSectionTab('/analise/sumario')).toBe('sumario');
    expect(resolveAnalysisSectionTab('/analise/configuracao')).toBe('sumario');
    expect(resolveAnalysisSectionTab('/analise/acoes-br')).toBe('acoes');
    expect(resolveAnalysisSectionTab('/analise/fiis')).toBe('fiis');
    expect(resolveAnalysisSectionTab('/analise/fiis/segmentos')).toBe('fiis');
    expect(resolveAnalysisSectionTab('/analise/internacional')).toBe('internacional');
    expect(resolveAnalysisSectionTab('/analise/criptomoedas')).toBe('cripto');
  });

  it('resolve href da aba sumário', () => {
    expect(analysisSectionTabHref('sumario', '/analise/fiis')).toBe('/analise/sumario');
    expect(analysisSectionTabHref('acoes', '/analise/sumario')).toBe('/analise/acoes-br');
  });
});
