<script lang="ts">
  import { goto } from '$app/navigation';

  import LucideIcon from '$lib/components/LucideIcon.svelte';

  import {
    ANALYSIS_SECTION_TABS,
    analysisSectionTabHref,
    type AnalysisSectionTabId
  } from './analysisSectionTabs';

  export let activeTab: AnalysisSectionTabId = 'sumario';
  export let pathname = '/analise/sumario';

  function handleSelect(tabId: AnalysisSectionTabId) {
    if (tabId === activeTab) {
      return;
    }
    void goto(analysisSectionTabHref(tabId, pathname));
  }
</script>

<div
  class="flex flex-wrap gap-2"
  role="tablist"
  aria-label="Seções da análise"
  data-testid="analysis-section-tabs"
>
  {#each ANALYSIS_SECTION_TABS as tab (tab.id)}
    <button
      type="button"
      role="tab"
      class="btn btn-sm gap-1.5 rounded-full border-0 px-3 font-normal normal-case shadow-none transition-colors
        {activeTab === tab.id
        ? 'bg-primary text-primary-content hover:bg-primary'
        : 'bg-base-200/80 text-base-content/80 hover:bg-base-300/80'}"
      aria-selected={activeTab === tab.id}
      data-testid="analysis-section-tab-{tab.id}"
      on:click={() => handleSelect(tab.id)}
    >
      <LucideIcon name={tab.icon} size="sm" aria-hidden="true" />
      {tab.label}
    </button>
  {/each}
</div>
