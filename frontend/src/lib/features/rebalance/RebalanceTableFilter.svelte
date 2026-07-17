<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { PORTFOLIO_POSITIONS_SEARCH_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';

  export let value = '';
  export let label = 'Filtrar';
  export let placeholder = 'Ticker ou nome';
  export let testId = 'rebalance-table-filter';
</script>

<label class="form-control w-full min-w-[12rem] max-w-xs">
  <span class="label-text text-xs font-semibold">{label}</span>
  <div class="relative">
    <LucideIcon
      name={PORTFOLIO_POSITIONS_SEARCH_LUCIDE_ICON}
      size="sm"
      class="pointer-events-none absolute left-2.5 top-1/2 -translate-y-1/2 text-base-content/45"
      aria-hidden="true"
    />
    <input
      type="search"
      class="input input-bordered input-sm w-full pl-8"
      {placeholder}
      data-testid={testId}
      bind:value
    />
  </div>
</label>
