import {
  PROVENTOS_ADD_TAB_LUCIDE_ICON,
  PROVENTOS_LIST_TAB_LUCIDE_ICON,
  PROVENTOS_SUMMARY_TAB_LUCIDE_ICON,
  type LucideIconName
} from '$lib/icons/lucideIconCatalog';

export type ProventosSectionTabId = 'resumo' | 'adicionar' | 'lancamentos';

export type ProventosSectionTabDef = {
  id: ProventosSectionTabId;
  label: string;
  href: string;
  icon: LucideIconName;
};

export const PROVENTOS_SECTION_TABS: ProventosSectionTabDef[] = [
  {
    id: 'resumo',
    label: 'Resumo',
    href: '/proventos/resumo',
    icon: PROVENTOS_SUMMARY_TAB_LUCIDE_ICON
  },
  {
    id: 'adicionar',
    label: 'Adicionar',
    href: '/proventos/adicionar',
    icon: PROVENTOS_ADD_TAB_LUCIDE_ICON
  },
  {
    id: 'lancamentos',
    label: 'Lançamentos',
    href: '/proventos/lancamentos',
    icon: PROVENTOS_LIST_TAB_LUCIDE_ICON
  }
];

export function resolveProventosSectionTab(pathname: string): ProventosSectionTabId {
  if (pathname.startsWith('/proventos/adicionar')) {
    return 'adicionar';
  }
  if (pathname.startsWith('/proventos/lancamentos')) {
    return 'lancamentos';
  }
  return 'resumo';
}

export function proventosSectionSubtitle(tabId: ProventosSectionTabId): string {
  switch (tabId) {
    case 'adicionar':
      return 'Cadastre um provento manualmente ou importe vários de uma vez.';
    case 'lancamentos':
      return 'Consulte, filtre, edite e remova os proventos já cadastrados.';
    default:
      return 'Total recebido, evolução por período e ativos que mais pagaram.';
  }
}
