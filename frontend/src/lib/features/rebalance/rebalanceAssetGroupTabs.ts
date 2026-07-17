import type { LucideIconName } from '$lib/icons/lucideIconCatalog';

export type RebalanceAssetGroupTab = 'stocks' | 'international' | 'funds' | 'crypto';

export type RebalanceAssetGroupTabDef = {
  id: RebalanceAssetGroupTab;
  label: string;
  icon: LucideIconName;
};

export const REBALANCE_ASSET_GROUP_TABS: RebalanceAssetGroupTabDef[] = [
  { id: 'stocks', label: 'Ações/ETF BR', icon: 'CandlestickChart' },
  { id: 'international', label: 'ETF internacional', icon: 'Globe' },
  { id: 'funds', label: 'FII', icon: 'Building2' },
  { id: 'crypto', label: 'Criptomoedas', icon: 'Bitcoin' }
];
