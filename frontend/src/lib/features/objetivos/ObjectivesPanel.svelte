<script lang="ts">
  import type { Objective } from '$lib/api/objetivos';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { createEventDispatcher } from 'svelte';

  import { OBJECTIVES_SUMMARY_TAB_ID } from './constants';
  import { filterUserVisibleObjectives } from './objectiveVisibility';

  export let objectives: Objective[] = [];
  export let selectedId: number | null = null;

  const dispatch = createEventDispatcher<{
    select: number;
    create: void;
  }>();

  function handleSelect(id: number) {
    dispatch('select', id);
  }

  $: visibleObjectives = filterUserVisibleObjectives(objectives);
</script>

<div class="flex flex-wrap items-center gap-2" data-testid="objetivos-panel">
  <button
    type="button"
    class="btn btn-sm"
    class:btn-primary={selectedId === OBJECTIVES_SUMMARY_TAB_ID}
    class:btn-outline={selectedId !== OBJECTIVES_SUMMARY_TAB_ID}
    data-testid="objetivo-tab-resumo"
    on:click={() => handleSelect(OBJECTIVES_SUMMARY_TAB_ID)}
  >
    Resumo
  </button>
  {#each visibleObjectives as objective (objective.id)}
    <button
      type="button"
      class="btn btn-sm"
      class:btn-primary={selectedId === objective.id}
      class:btn-outline={selectedId !== objective.id}
      data-testid={`objetivo-card-${objective.id}`}
      on:click={() => handleSelect(objective.id)}
    >
      {objective.name}
      <span class="badge badge-ghost ml-1">{formatBrl(objective.total_value_brl)}</span>
      {#if objective.mode === 'single_asset'}
        <span class="badge badge-info badge-xs ml-1">1 ativo</span>
      {/if}
    </button>
  {/each}
  <button type="button" class="btn btn-sm btn-ghost" data-testid="objetivo-create-btn" on:click={() => dispatch('create')}>
    + Novo objetivo
  </button>
</div>
