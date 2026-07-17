import {
  ANALYSIS_SECTION_TABS,
  type AnalysisSectionTabId
} from './analysisSectionTabs';

export const ANALYSIS_PROFILE_TO_TAB: Record<string, AnalysisSectionTabId> = {
  stock_br: 'acoes',
  fii_br: 'fiis',
  etf_intl: 'internacional',
  crypto: 'cripto'
};

export function analysisAreaLabelForProfile(profile: string): string {
  const tabId = ANALYSIS_PROFILE_TO_TAB[profile];
  const tab = ANALYSIS_SECTION_TABS.find((item) => item.id === tabId);
  return tab?.label ?? profile;
}

export function analysisAreaHrefForProfile(profile: string): string {
  const tabId = ANALYSIS_PROFILE_TO_TAB[profile];
  const tab = ANALYSIS_SECTION_TABS.find((item) => item.id === tabId);
  return tab?.href ?? '/analise/sumario';
}
