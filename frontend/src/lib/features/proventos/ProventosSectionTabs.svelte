<script lang="ts">
  import { goto } from '$app/navigation';

  import LucideIcon from '$lib/components/LucideIcon.svelte';

  import {
    PROVENTOS_SECTION_TABS,
    type ProventosSectionTabId
  } from './proventosSectionTabs';

  export let activeTab: ProventosSectionTabId = 'resumo';

  function handleSelect(tab: ProventosSectionTabId, href: string) {
    if (tab === activeTab) {
      return;
    }
    void goto(href);
  }
</script>

<div
  class="flex flex-wrap gap-2"
  role="tablist"
  aria-label="Seções de proventos"
  data-testid="proventos-section-tabs"
>
  {#each PROVENTOS_SECTION_TABS as tab (tab.id)}
    <button
      type="button"
      role="tab"
      class="btn btn-sm gap-1.5 rounded-full border-0 px-3 font-normal normal-case shadow-none transition-colors
        {activeTab === tab.id
        ? 'bg-primary text-primary-content hover:bg-primary'
        : 'bg-base-200/80 text-base-content/80 hover:bg-base-300/80'}"
      aria-selected={activeTab === tab.id}
      data-testid="proventos-section-tab-{tab.id}"
      on:click={() => handleSelect(tab.id, tab.href)}
    >
      <LucideIcon name={tab.icon} size="sm" aria-hidden="true" />
      {tab.label}
    </button>
  {/each}
</div>
