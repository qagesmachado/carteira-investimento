<script lang="ts">
  import { goto } from '$app/navigation';

  import LucideIcon from '$lib/components/LucideIcon.svelte';

  import { getBudgetLayoutContext } from './budgetLayoutContext';
  import {
    FINANCEIRO_SECTION_TABS,
    financeiroSectionTabHref,
    type FinanceiroSectionTabDef,
    type FinanceiroSectionTabId
  } from './financeiroSectionTabs';

  export let activeTab: FinanceiroSectionTabId = 'painel';

  const { yearMonth } = getBudgetLayoutContext();

  function handleSelect(tab: FinanceiroSectionTabDef) {
    const href = financeiroSectionTabHref(tab, $yearMonth);
    if (tab.id === activeTab) {
      return;
    }
    void goto(href);
  }
</script>

<div
  class="flex flex-wrap gap-2"
  role="tablist"
  aria-label="Seções do financeiro"
  data-testid="financeiro-section-tabs"
>
  {#each FINANCEIRO_SECTION_TABS as tab (tab.id)}
    <button
      type="button"
      role="tab"
      class="btn btn-sm gap-1.5 rounded-full border-0 px-3 font-normal normal-case shadow-none transition-colors
        {activeTab === tab.id
        ? 'bg-primary text-primary-content hover:bg-primary'
        : 'bg-base-200/80 text-base-content/80 hover:bg-base-300/80'}"
      aria-selected={activeTab === tab.id}
      data-testid="financeiro-section-tab-{tab.id}"
      on:click={() => handleSelect(tab)}
    >
      <LucideIcon name={tab.icon} size="sm" aria-hidden="true" />
      {tab.label}
    </button>
  {/each}
</div>
