import type { AssetType } from '$lib/api/assets';
import { formatAssetTypeForDisplay, formatDisplayClassForDisplay } from '$lib/assetLabels';
import type { DashboardPatrimonyFilterAvailability } from '$lib/features/dashboard/dashboardPatrimonyScope';

export type ConsolidadaSortKey =
  | 'ticker'
  | 'name'
  | 'asset_type'
  | 'display_class'
  | 'currency'
  | 'quantity'
  | 'invested'
  | 'current'
  | 'profit';

export const CONSOLIDADA_SORT_KEY_LABELS: Record<ConsolidadaSortKey, string> = {
  ticker: 'Ticker',
  name: 'Nome',
  asset_type: 'Tipo',
  display_class: 'Classe',
  currency: 'Moeda',
  quantity: 'Qtd',
  invested: 'Aplicado',
  current: 'Atual',
  profit: 'Lucro'
};

export const FILTER_DISPLAY_CLASS_NATIONAL = '__national__';

export type ConsolidadaFilterChip = {
  id: string;
  label: string;
};

export type ConsolidadaFilterState = {
  filterText: string;
  filterAssetTypeStr: string;
  filterDisplayClassStr: string;
  filterCurrency: string;
  /** Quando true, inclui parcelas marcadas como «não investimento» nos valores e na grade. */
  filterIncludeNonInvestment: boolean;
  /** Quando true, inclui posições de previdência na grade e nos totais. */
  filterIncludePension: boolean;
};

export function countActiveConsolidadaFilters(state: ConsolidadaFilterState): number {
  let count = 0;
  if (state.filterText.trim()) {
    count += 1;
  }
  if (state.filterAssetTypeStr) {
    count += 1;
  }
  if (state.filterDisplayClassStr) {
    count += 1;
  }
  if (state.filterCurrency.trim()) {
    count += 1;
  }
  if (state.filterIncludeNonInvestment) {
    count += 1;
  }
  if (state.filterIncludePension) {
    count += 1;
  }
  return count;
}

export function hasActiveConsolidadaFilters(state: ConsolidadaFilterState): boolean {
  return countActiveConsolidadaFilters(state) > 0;
}

export function buildConsolidadaFilterChips(
  state: ConsolidadaFilterState
): ConsolidadaFilterChip[] {
  const chips: ConsolidadaFilterChip[] = [];
  const text = state.filterText.trim();
  if (text) {
    chips.push({ id: 'text', label: `Busca: ${text}` });
  }
  if (state.filterAssetTypeStr) {
    chips.push({
      id: 'asset_type',
      label: `Tipo: ${formatAssetTypeForDisplay(state.filterAssetTypeStr as AssetType)}`
    });
  }
  if (state.filterDisplayClassStr === FILTER_DISPLAY_CLASS_NATIONAL) {
    chips.push({ id: 'display_class', label: 'Classe: Nacional' });
  } else if (state.filterDisplayClassStr) {
    chips.push({
      id: 'display_class',
      label: `Classe: ${formatDisplayClassForDisplay(state.filterDisplayClassStr)}`
    });
  }
  const currency = state.filterCurrency.trim();
  if (currency) {
    chips.push({ id: 'currency', label: `Moeda: ${currency}` });
  }
  if (state.filterIncludeNonInvestment) {
    chips.push({ id: 'include_non_investment', label: 'Ativos que não são investimento' });
  }
  if (state.filterIncludePension) {
    chips.push({ id: 'include_pension', label: 'Previdência' });
  }
  return chips;
}

export function clearConsolidadaFilterField(
  state: ConsolidadaFilterState,
  chipId: string
): ConsolidadaFilterState {
  switch (chipId) {
    case 'text':
      return { ...state, filterText: '' };
    case 'asset_type':
      return { ...state, filterAssetTypeStr: '' };
    case 'display_class':
      return { ...state, filterDisplayClassStr: '' };
    case 'currency':
      return { ...state, filterCurrency: '' };
    case 'include_non_investment':
      return { ...state, filterIncludeNonInvestment: false };
    case 'include_pension':
      return { ...state, filterIncludePension: false };
    default:
      return state;
  }
}

export function clearAllConsolidadaFilters(state: ConsolidadaFilterState): ConsolidadaFilterState {
  return {
    ...state,
    filterText: '',
    filterAssetTypeStr: '',
    filterDisplayClassStr: '',
    filterCurrency: '',
    filterIncludeNonInvestment: false,
    filterIncludePension: false
  };
}

export function sanitizeConsolidadaPatrimonyFilters(
  state: ConsolidadaFilterState,
  availability: DashboardPatrimonyFilterAvailability
): ConsolidadaFilterState {
  const filterIncludeNonInvestment = availability.hasNonInvestment
    ? state.filterIncludeNonInvestment
    : false;
  const filterIncludePension = availability.hasPension ? state.filterIncludePension : false;
  if (
    filterIncludeNonInvestment === state.filterIncludeNonInvestment &&
    filterIncludePension === state.filterIncludePension
  ) {
    return state;
  }
  return { ...state, filterIncludeNonInvestment, filterIncludePension };
}

export function formatConsolidadaSortLabel(
  sortKey: ConsolidadaSortKey,
  sortDir: 'asc' | 'desc'
): string {
  const label = CONSOLIDADA_SORT_KEY_LABELS[sortKey];
  return `${label} ${sortDir === 'asc' ? '↑' : '↓'}`;
}
