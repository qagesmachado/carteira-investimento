import { describe, expect, it } from 'vitest';

import {
  PROVENTOS_SECTION_TABS,
  proventosSectionSubtitle,
  resolveProventosSectionTab
} from './proventosSectionTabs';

describe('PROVENTOS_SECTION_TABS', () => {
  it('mantém a ordem Resumo, Adicionar, Lançamentos', () => {
    expect(PROVENTOS_SECTION_TABS.map((tab) => tab.id)).toEqual([
      'resumo',
      'adicionar',
      'lancamentos'
    ]);
  });

  it('aponta cada aba para sua rota', () => {
    expect(PROVENTOS_SECTION_TABS.map((tab) => tab.href)).toEqual([
      '/proventos/resumo',
      '/proventos/adicionar',
      '/proventos/lancamentos'
    ]);
  });
});

describe('resolveProventosSectionTab', () => {
  it('resolve adicionar', () => {
    expect(resolveProventosSectionTab('/proventos/adicionar')).toBe('adicionar');
  });

  it('resolve lancamentos', () => {
    expect(resolveProventosSectionTab('/proventos/lancamentos')).toBe('lancamentos');
  });

  it('cai em resumo por padrão (inclusive rota base)', () => {
    expect(resolveProventosSectionTab('/proventos/resumo')).toBe('resumo');
    expect(resolveProventosSectionTab('/proventos')).toBe('resumo');
  });
});

describe('proventosSectionSubtitle', () => {
  it('retorna um subtítulo distinto por aba', () => {
    const subtitles = new Set([
      proventosSectionSubtitle('resumo'),
      proventosSectionSubtitle('adicionar'),
      proventosSectionSubtitle('lancamentos')
    ]);
    expect(subtitles.size).toBe(3);
  });
});
