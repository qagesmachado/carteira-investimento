<script lang="ts">
  import { dashboardPatrimonyFilters } from './dashboardPatrimonyFilters';
  import type { DashboardPatrimonyFilterAvailability } from './dashboardPatrimonyScope';
  import { hasDashboardPatrimonyFilterOptions } from './dashboardPatrimonyScope';

  export let filterAvailability: DashboardPatrimonyFilterAvailability = {
    hasNonInvestment: false,
    hasPension: false
  };
  export let compact = false;

  $: showFilters = hasDashboardPatrimonyFilterOptions(filterAvailability);

  function onNonInvestmentChange(event: Event) {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    dashboardPatrimonyFilters.update((filters) => ({
      ...filters,
      includeNonInvestment: checked
    }));
  }

  function onPensionChange(event: Event) {
    const checked = (event.currentTarget as HTMLInputElement).checked;
    dashboardPatrimonyFilters.update((filters) => ({
      ...filters,
      includePension: checked
    }));
  }
</script>

{#if showFilters}
  <div
    class={compact
      ? 'flex flex-wrap items-center gap-x-4 gap-y-1'
      : 'flex flex-col gap-1.5'}
    data-testid="dashboard-patrimony-filters"
  >
    {#if filterAvailability.hasNonInvestment}
      <label class="flex cursor-pointer items-center gap-1.5 text-xs text-base-content/70">
        <input
          type="checkbox"
          class="checkbox checkbox-xs shrink-0"
          checked={$dashboardPatrimonyFilters.includeNonInvestment}
          data-testid="dashboard-filter-non-investment"
          on:change={onNonInvestmentChange}
        />
        <span>Ativos que não são investimento</span>
      </label>
    {/if}
    {#if filterAvailability.hasPension}
      <label class="flex cursor-pointer items-center gap-1.5 text-xs text-base-content/70">
        <input
          type="checkbox"
          class="checkbox checkbox-xs shrink-0"
          checked={$dashboardPatrimonyFilters.includePension}
          data-testid="dashboard-filter-pension"
          on:change={onPensionChange}
        />
        <span>Previdência</span>
      </label>
    {/if}
  </div>
{/if}
