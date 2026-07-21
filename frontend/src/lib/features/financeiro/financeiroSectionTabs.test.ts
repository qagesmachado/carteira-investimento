import { describe, expect, it } from 'vitest';

import {
  FINANCEIRO_SECTION_TABS,
  financeiroSectionSubtitle,
  financeiroSectionTabHref,
  financeiroSectionTabIsMonthly,
  resolveFinanceiroSectionTab
} from './financeiroSectionTabs';

describe('FINANCEIRO_SECTION_TABS', () => {
  it('mantém a ordem Painel, Orçamento, Despesas, Controle, Metas, Renda, Perfis', () => {
    expect(FINANCEIRO_SECTION_TABS.map((tab) => tab.id)).toEqual([
      'painel',
      'orcamento',
      'despesas',
      'controle',
      'metas',
      'renda',
      'perfis'
    ]);
  });

  it('marca como mensais orçamento, despesas, controle e renda', () => {
    const monthly = FINANCEIRO_SECTION_TABS.filter((tab) => tab.monthly).map((tab) => tab.id);
    expect(monthly).toEqual(['orcamento', 'despesas', 'controle', 'renda']);
  });
});

describe('financeiroSectionTabHref', () => {
  it('inclui o mês nas rotas mensais', () => {
    const orcamento = FINANCEIRO_SECTION_TABS.find((tab) => tab.id === 'orcamento')!;
    const despesas = FINANCEIRO_SECTION_TABS.find((tab) => tab.id === 'despesas')!;
    const controle = FINANCEIRO_SECTION_TABS.find((tab) => tab.id === 'controle')!;
    const renda = FINANCEIRO_SECTION_TABS.find((tab) => tab.id === 'renda')!;
    expect(financeiroSectionTabHref(orcamento, '2026-07')).toBe('/financeiro/orcamento/2026-07');
    expect(financeiroSectionTabHref(despesas, '2026-07')).toBe('/financeiro/despesas/2026-07');
    expect(financeiroSectionTabHref(controle, '2026-07')).toBe('/financeiro/controle/2026-07');
    expect(financeiroSectionTabHref(renda, '2026-07')).toBe('/financeiro/renda/2026-07');
  });

  it('ignora o mês nas rotas fixas', () => {
    const painel = FINANCEIRO_SECTION_TABS.find((tab) => tab.id === 'painel')!;
    const metas = FINANCEIRO_SECTION_TABS.find((tab) => tab.id === 'metas')!;
    const perfis = FINANCEIRO_SECTION_TABS.find((tab) => tab.id === 'perfis')!;
    expect(financeiroSectionTabHref(painel, '2026-07')).toBe('/financeiro');
    expect(financeiroSectionTabHref(metas, '2026-07')).toBe('/financeiro/metas');
    expect(financeiroSectionTabHref(perfis, '2026-07')).toBe('/financeiro/perfis');
  });
});

describe('financeiroSectionTabIsMonthly', () => {
  it('reconhece abas mensais e fixas', () => {
    expect(financeiroSectionTabIsMonthly('orcamento')).toBe(true);
    expect(financeiroSectionTabIsMonthly('despesas')).toBe(true);
    expect(financeiroSectionTabIsMonthly('controle')).toBe(true);
    expect(financeiroSectionTabIsMonthly('renda')).toBe(true);
    expect(financeiroSectionTabIsMonthly('painel')).toBe(false);
    expect(financeiroSectionTabIsMonthly('metas')).toBe(false);
    expect(financeiroSectionTabIsMonthly('perfis')).toBe(false);
  });
});

describe('resolveFinanceiroSectionTab', () => {
  it('resolve as rotas mensais com parâmetro', () => {
    expect(resolveFinanceiroSectionTab('/financeiro/orcamento/2026-07')).toBe('orcamento');
    expect(resolveFinanceiroSectionTab('/financeiro/despesas/2026-07')).toBe('despesas');
    expect(resolveFinanceiroSectionTab('/financeiro/controle/2026-07')).toBe('controle');
    expect(resolveFinanceiroSectionTab('/financeiro/renda/2026-07')).toBe('renda');
  });

  it('resolve metas (inclusive tags) e perfis', () => {
    expect(resolveFinanceiroSectionTab('/financeiro/metas')).toBe('metas');
    expect(resolveFinanceiroSectionTab('/financeiro/metas/tags')).toBe('metas');
    expect(resolveFinanceiroSectionTab('/financeiro/perfis')).toBe('perfis');
  });

  it('cai em painel por padrão (inclusive rota base)', () => {
    expect(resolveFinanceiroSectionTab('/financeiro')).toBe('painel');
    expect(resolveFinanceiroSectionTab('/financeiro/')).toBe('painel');
  });
});

describe('financeiroSectionSubtitle', () => {
  it('retorna um subtítulo distinto por aba', () => {
    const subtitles = new Set(
      FINANCEIRO_SECTION_TABS.map((tab) => financeiroSectionSubtitle(tab.id))
    );
    expect(subtitles.size).toBe(FINANCEIRO_SECTION_TABS.length);
  });
});
