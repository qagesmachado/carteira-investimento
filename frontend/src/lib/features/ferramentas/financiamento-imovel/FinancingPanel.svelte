<script lang="ts">
  import type { PropertyFinancing } from '$lib/api/propertyFinancings';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { createEventDispatcher } from 'svelte';

  import { FINANCING_SUMMARY_TAB_ID } from './constants';
  import { formatPropertyType } from './propertyTypeLabels';

  export let financings: PropertyFinancing[] = [];
  export let selectedId: number | null = null;

  const dispatch = createEventDispatcher<{ select: number; create: void }>();
</script>

<div class="flex flex-wrap items-center gap-2" data-testid="financing-panel">
  <button
    type="button"
    class="btn btn-sm"
    class:btn-primary={selectedId === FINANCING_SUMMARY_TAB_ID}
    class:btn-outline={selectedId !== FINANCING_SUMMARY_TAB_ID}
    data-testid="financing-tab-resumo"
    on:click={() => dispatch('select', FINANCING_SUMMARY_TAB_ID)}
  >
    Resumo
  </button>
  {#each financings as financing (financing.id)}
    <button
      type="button"
      class="btn btn-sm"
      class:btn-primary={selectedId === financing.id}
      class:btn-outline={selectedId !== financing.id}
      data-testid={`financing-tab-${financing.id}`}
      on:click={() => dispatch('select', financing.id)}
    >
      {financing.name}
      <span class="badge badge-ghost ml-1">{formatPropertyType(financing.property_type)}</span>
    </button>
  {/each}
  <button
    type="button"
    class="btn btn-sm btn-ghost"
    data-testid="financing-create-btn"
    on:click={() => dispatch('create')}
  >
    + Novo imóvel
  </button>
</div>
