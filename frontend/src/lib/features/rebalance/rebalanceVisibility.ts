import type { ClassRebalanceRow } from '$lib/api/rebalance';

import {
  REBALANCE_ASSET_GROUP_TABS,
  type RebalanceAssetGroupTab,
  type RebalanceAssetGroupTabDef
} from './rebalanceAssetGroupTabs';

export const MIN_REBALANCE_TARGET_PERCENT = 1;

export const ASSET_GROUP_TAB_DISPLAY_CLASS: Record<RebalanceAssetGroupTab, string> = {
  stocks: 'stocks',
  international: 'international',
  funds: 'funds',
  crypto: 'crypto'
};

export function isRebalanceTargetConfigured(targetPercent: number): boolean {
  return Number.isFinite(targetPercent) && targetPercent >= MIN_REBALANCE_TARGET_PERCENT;
}

export function filterConfiguredRebalanceClasses(classes: ClassRebalanceRow[]): ClassRebalanceRow[] {
  return classes.filter((row) => isRebalanceTargetConfigured(row.target_percent));
}

export function sumClassRebalanceGapBrl(classes: ClassRebalanceRow[]): number {
  return filterConfiguredRebalanceClasses(classes).reduce((sum, row) => sum + row.gap_brl, 0);
}

export function sumClassRebalanceTargetPercent(classes: ClassRebalanceRow[]): number {
  return filterConfiguredRebalanceClasses(classes).reduce((sum, row) => sum + row.target_percent, 0);
}

export function sumClassRebalanceCurrentPercent(classes: ClassRebalanceRow[]): number {
  return filterConfiguredRebalanceClasses(classes).reduce((sum, row) => sum + row.current_percent, 0);
}

export function sumClassRebalanceCurrentValueBrl(classes: ClassRebalanceRow[]): number {
  return filterConfiguredRebalanceClasses(classes).reduce((sum, row) => sum + row.current_value_brl, 0);
}

export function sumClassRebalanceTargetValueBrl(classes: ClassRebalanceRow[]): number {
  return filterConfiguredRebalanceClasses(classes).reduce((sum, row) => sum + row.target_value_brl, 0);
}

export function visibleAssetGroupTabs(
  classes: Pick<ClassRebalanceRow, 'display_class' | 'target_percent'>[]
): RebalanceAssetGroupTabDef[] {
  const targetByClass = new Map(classes.map((row) => [row.display_class, row.target_percent]));
  return REBALANCE_ASSET_GROUP_TABS.filter((tab) => {
    const targetPercent = targetByClass.get(ASSET_GROUP_TAB_DISPLAY_CLASS[tab.id]);
    return targetPercent != null && isRebalanceTargetConfigured(targetPercent);
  });
}

export function resolveAssetGroupTab(
  classes: Pick<ClassRebalanceRow, 'display_class' | 'target_percent'>[],
  preferred: RebalanceAssetGroupTab
): RebalanceAssetGroupTab {
  const visibleTabs = visibleAssetGroupTabs(classes);
  if (visibleTabs.some((tab) => tab.id === preferred)) {
    return preferred;
  }
  return visibleTabs[0]?.id ?? preferred;
}
