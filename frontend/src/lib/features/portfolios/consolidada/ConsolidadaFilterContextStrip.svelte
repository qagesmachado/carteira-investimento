<script lang="ts">
  import {
    countActiveConsolidadaFilters,
    formatConsolidadaSortLabel,
    type ConsolidadaFilterState,
    type ConsolidadaSortKey
  } from './consolidadaFilterState';

  export let filterState: ConsolidadaFilterState;
  export let visibleCount = 0;
  export let sortKey: ConsolidadaSortKey = 'ticker';
  export let sortDir: 'asc' | 'desc' = 'asc';

  $: activeFilters = countActiveConsolidadaFilters(filterState);
  $: sortLabel = formatConsolidadaSortLabel(sortKey, sortDir);
</script>

<p
  class="text-sm text-base-content/65"
  data-testid="consolidada-filter-context"
>
  <span class="font-medium text-base-content/80">{visibleCount}</span>
  {visibleCount === 1 ? 'posição visível' : 'posições visíveis'}
  {#if activeFilters > 0}
    · <span class="font-medium text-base-content/80">{activeFilters}</span>
    {activeFilters === 1 ? 'filtro ativo' : 'filtros ativos'}
  {/if}
  · ordenado por {sortLabel}
</p>
