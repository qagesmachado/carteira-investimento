<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    ANALYSIS_PENDING_LUCIDE_ICON,
    PORTFOLIO_POSITIONS_CLASSIFY_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  export let isPending = false;
  export let classifyTestId: string | undefined = undefined;
  export let onClassify: () => void = () => undefined;
</script>

<div class="flex flex-wrap items-center gap-1 whitespace-nowrap">
  {#if isPending}
    <span
      class="inline-flex items-center gap-1 text-warning"
      data-testid="analysis-row-pending-badge"
    >
      <LucideIcon name={ANALYSIS_PENDING_LUCIDE_ICON} size="sm" />
      <span class="text-xs font-medium">Pendente</span>
    </span>
  {/if}
  <button
    type="button"
    class="btn btn-outline btn-xs gap-1"
    aria-label="Classificar"
    data-testid={classifyTestId}
    on:click={onClassify}
  >
    <LucideIcon name={PORTFOLIO_POSITIONS_CLASSIFY_LUCIDE_ICON} size="sm" />
    <span class="hidden sm:inline">Classificar</span>
  </button>
</div>
