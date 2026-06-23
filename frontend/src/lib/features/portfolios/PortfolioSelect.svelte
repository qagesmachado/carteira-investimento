<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { Portfolio } from '$lib/api/portfolios';
  import { readPortfolioIdFromSelectEvent } from './portfolioSelect';

  export let portfolios: Portfolio[] = [];
  export let activeId: number | null = null;
  export let disabled = false;
  export let selectClass = 'select select-bordered select-sm w-full max-w-xs';
  export let ariaLabel = 'Selecionar carteira';
  export let emptyOptionLabel = 'Nenhuma carteira';
  export let testId: string | undefined = undefined;

  const dispatch = createEventDispatcher<{ select: number }>();

  $: selectValue = activeId != null ? String(activeId) : '';

  function handleChange(event: Event) {
    const id = readPortfolioIdFromSelectEvent(event);
    if (id == null || id === activeId) {
      return;
    }
    dispatch('select', id);
  }
</script>

<select
  class={selectClass}
  {disabled}
  value={selectValue}
  data-testid={testId}
  on:change={handleChange}
  aria-label={ariaLabel}
>
  {#if portfolios.length === 0}
    <option value="">{emptyOptionLabel}</option>
  {:else}
    {#each portfolios as portfolio (portfolio.id)}
      <option value={String(portfolio.id)}>{portfolio.name}</option>
    {/each}
  {/if}
</select>
