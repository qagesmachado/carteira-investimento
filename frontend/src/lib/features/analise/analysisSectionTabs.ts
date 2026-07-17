import type { LucideIconName } from '$lib/icons/lucideIconCatalog';

export type AnalysisSectionTabId = 'sumario' | 'acoes' | 'fiis' | 'internacional' | 'cripto';

export type AnalysisSectionTabDef = {
  id: AnalysisSectionTabId;
  label: string;
  href: string;
  icon: LucideIconName;
};

export const ANALYSIS_SECTION_TABS: AnalysisSectionTabDef[] = [
  {
    id: 'sumario',
    label: 'Sumário',
    href: '/analise/sumario',
    icon: 'LayoutDashboard'
  },
  {
    id: 'acoes',
    label: 'Ações/ETF BR',
    href: '/analise/acoes-br',
    icon: 'CandlestickChart'
  },
  {
    id: 'fiis',
    label: 'FIIs',
    href: '/analise/fiis',
    icon: 'Building2'
  },
  {
    id: 'internacional',
    label: 'Internacional',
    href: '/analise/internacional',
    icon: 'Globe'
  },
  {
    id: 'cripto',
    label: 'Criptomoedas',
    href: '/analise/criptomoedas',
    icon: 'Bitcoin'
  }
];

export const ANALYSIS_HUB_NAV_ITEMS = ANALYSIS_SECTION_TABS.filter((tab) => tab.id !== 'sumario');

export function resolveAnalysisSectionTab(pathname: string): AnalysisSectionTabId {
  if (pathname.startsWith('/analise/sumario') || pathname.startsWith('/analise/configuracao')) {
    return 'sumario';
  }
  if (pathname.startsWith('/analise/acoes-br')) {
    return 'acoes';
  }
  if (
    pathname.startsWith('/analise/fiis') &&
    !pathname.startsWith('/analise/fiis/internacional')
  ) {
    return 'fiis';
  }
  if (pathname.startsWith('/analise/internacional')) {
    return 'internacional';
  }
  if (pathname.startsWith('/analise/criptomoedas')) {
    return 'cripto';
  }
  return 'sumario';
}

export function analysisSectionTabHref(tabId: AnalysisSectionTabId, pathname: string): string {
  const tab = ANALYSIS_SECTION_TABS.find((item) => item.id === tabId);
  if (!tab) {
    return '/analise/sumario';
  }
  return tab.href;
}

export function analysisSectionSubtitle(tabId: AnalysisSectionTabId): string {
  switch (tabId) {
    case 'sumario':
      return 'Visão geral da análise: status da carteira ativa e atalhos para cada área.';
    case 'fiis':
      return 'Classificação de viabilidade e diagrama para fundos imobiliários.';
    case 'cripto':
      return 'Alocação percentual na estratégia Criptomoeda.';
    case 'internacional':
      return 'Alocação percentual de ETFs internacionais.';
    default:
      return 'Classificação fundamental e diagrama para ações/ETF BR.';
  }
}
