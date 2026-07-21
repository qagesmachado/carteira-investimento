import {
  FINANCEIRO_BUDGET_LUCIDE_ICON,
  FINANCEIRO_CONTROLE_LUCIDE_ICON,
  FINANCEIRO_EXPENSES_LUCIDE_ICON,
  FINANCEIRO_FINANCIAMENTO_LUCIDE_ICON,
  FINANCEIRO_GOALS_LUCIDE_ICON,
  FINANCEIRO_INCOME_LUCIDE_ICON,
  FINANCEIRO_PANEL_LUCIDE_ICON,
  FINANCEIRO_PROFILES_LUCIDE_ICON,
  type LucideIconName
} from '$lib/icons/lucideIconCatalog';

export type FinanceiroSectionTabId =
  | 'painel'
  | 'orcamento'
  | 'despesas'
  | 'controle'
  | 'metas'
  | 'renda'
  | 'financiamento'
  | 'perfis';

export type FinanceiroSectionTabDef = {
  id: FinanceiroSectionTabId;
  label: string;
  icon: LucideIconName;
  /** Rotas mensais recebem o `yearMonth` atual ao montar o href. */
  monthly: boolean;
};

export const FINANCEIRO_SECTION_TABS: FinanceiroSectionTabDef[] = [
  { id: 'painel', label: 'Painel', icon: FINANCEIRO_PANEL_LUCIDE_ICON, monthly: false },
  { id: 'orcamento', label: 'Orçamento', icon: FINANCEIRO_BUDGET_LUCIDE_ICON, monthly: true },
  { id: 'despesas', label: 'Despesas', icon: FINANCEIRO_EXPENSES_LUCIDE_ICON, monthly: true },
  { id: 'controle', label: 'Controle', icon: FINANCEIRO_CONTROLE_LUCIDE_ICON, monthly: true },
  { id: 'metas', label: 'Metas', icon: FINANCEIRO_GOALS_LUCIDE_ICON, monthly: false },
  { id: 'renda', label: 'Renda', icon: FINANCEIRO_INCOME_LUCIDE_ICON, monthly: true },
  {
    id: 'financiamento',
    label: 'Financiamento',
    icon: FINANCEIRO_FINANCIAMENTO_LUCIDE_ICON,
    monthly: false
  },
  { id: 'perfis', label: 'Perfis', icon: FINANCEIRO_PROFILES_LUCIDE_ICON, monthly: false }
];

/** Abas que dependem do mês selecionado (exibem o navegador de mês). */
export function financeiroSectionTabIsMonthly(tabId: FinanceiroSectionTabId): boolean {
  return FINANCEIRO_SECTION_TABS.find((tab) => tab.id === tabId)?.monthly ?? false;
}

/** Monta o href da aba, incluindo o mês corrente para as rotas mensais. */
export function financeiroSectionTabHref(
  tab: FinanceiroSectionTabDef,
  yearMonth: string
): string {
  switch (tab.id) {
    case 'orcamento':
      return `/financeiro/orcamento/${yearMonth}`;
    case 'despesas':
      return `/financeiro/despesas/${yearMonth}`;
    case 'controle':
      return `/financeiro/controle/${yearMonth}`;
    case 'renda':
      return `/financeiro/renda/${yearMonth}`;
    case 'metas':
      return '/financeiro/metas';
    case 'financiamento':
      return '/financeiro/financiamento-imovel';
    case 'perfis':
      return '/financeiro/perfis';
    default:
      return '/financeiro';
  }
}

export function resolveFinanceiroSectionTab(pathname: string): FinanceiroSectionTabId {
  if (pathname.startsWith('/financeiro/orcamento')) {
    return 'orcamento';
  }
  if (pathname.startsWith('/financeiro/despesas')) {
    return 'despesas';
  }
  if (pathname.startsWith('/financeiro/controle')) {
    return 'controle';
  }
  if (pathname.startsWith('/financeiro/metas')) {
    return 'metas';
  }
  if (pathname.startsWith('/financeiro/renda')) {
    return 'renda';
  }
  if (pathname.startsWith('/financeiro/financiamento-imovel')) {
    return 'financiamento';
  }
  if (pathname.startsWith('/financeiro/perfis')) {
    return 'perfis';
  }
  return 'painel';
}

export function financeiroSectionSubtitle(tabId: FinanceiroSectionTabId): string {
  switch (tabId) {
    case 'orcamento':
      return 'Defina metas por categoria e acompanhe o planejado do mês.';
    case 'despesas':
      return 'Registre e organize os gastos do mês por categoria.';
    case 'controle':
      return 'Conferir se as rendas e despesas recorrentes do mês já entraram ou foram pagas.';
    case 'metas':
      return 'Distribua sua renda em metas percentuais e gerencie as tags.';
    case 'renda':
      return 'Cadastre as fontes de renda que abastecem o orçamento do mês.';
    case 'financiamento':
      return 'Registre receitas e despesas por imóvel e acompanhe lucro e capital investido.';
    case 'perfis':
      return 'Gerencie os perfis de orçamento (ex.: pessoal, família).';
    default:
      return 'Controle orçamentário doméstico: renda, metas, despesas e evolução.';
  }
}
