<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';

  import {
    REBALANCE_ASSET_GROUP_TABS,
    type RebalanceAssetGroupTab,
    type RebalanceAssetGroupTabDef
  } from './rebalanceAssetGroupTabs';

  export let activeTab: RebalanceAssetGroupTab = 'stocks';
  export let tabs: RebalanceAssetGroupTabDef[] = REBALANCE_ASSET_GROUP_TABS;

  export let onSelect: (tab: RebalanceAssetGroupTab) => void = () => undefined;
</script>

<div
  class="flex flex-wrap gap-2"
  role="tablist"
  aria-label="Grupo de ativos"
  data-testid="rebalance-asset-group-tabs"
>
  {#each tabs as tab (tab.id)}
    <button
      type="button"
      role="tab"
      class="btn btn-sm gap-1.5 rounded-full border-0 px-3 font-normal normal-case shadow-none transition-colors
        {activeTab === tab.id
        ? 'bg-primary text-primary-content hover:bg-primary'
        : 'bg-base-200/80 text-base-content/80 hover:bg-base-300/80'}"
      aria-selected={activeTab === tab.id}
      data-testid="rebalance-asset-tab-{tab.id}"
      on:click={() => onSelect(tab.id)}
    >
      <LucideIcon name={tab.icon} size="sm" aria-hidden="true" />
      {tab.label}
    </button>
  {/each}
</div>
