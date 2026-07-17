<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import type { ClassRebalanceRow } from '$lib/api/rebalance';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import {
    countClassesAboveTarget,
    countClassesBelowTarget
  } from '$lib/features/rebalance/formatRebalanceDeviation';
  import {
    DASHBOARD_PATRIMONY_LUCIDE_ICON,
    REBALANCE_ABOVE_TARGET_LUCIDE_ICON,
    REBALANCE_BELOW_TARGET_LUCIDE_ICON,
    REBALANCE_DEVIATION_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';

  export let classes: ClassRebalanceRow[] = [];
  export let patrimonyBrl = 0;
  export let totalGapBrl = 0;
  export let finalPatrimonyBrl: number | null = null;

  const cardClass =
    'flex min-w-[10rem] flex-1 items-center gap-3 rounded-box border border-base-300 bg-base-100 px-4 py-3';

  $: aboveCount = countClassesAboveTarget(classes);
  $: belowCount = countClassesBelowTarget(classes);
</script>

<div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4" data-testid="rebalance-kpi-cards">
  <div class={cardClass} data-testid="rebalance-kpi-patrimony">
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary"
      aria-hidden="true"
    >
      <LucideIcon name={DASHBOARD_PATRIMONY_LUCIDE_ICON} size="md" />
    </div>
    <div class="min-w-0">
      <p class="text-xs text-base-content/60">Patrimônio</p>
      <p class="truncate text-base font-semibold">{formatBrl(patrimonyBrl)}</p>
      {#if finalPatrimonyBrl != null}
        <p class="text-xs text-base-content/60">
          Final: {formatBrl(finalPatrimonyBrl)}
        </p>
      {/if}
    </div>
  </div>

  <div class={cardClass} data-testid="rebalance-kpi-total-gap">
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-warning/10 text-warning"
      aria-hidden="true"
    >
      <LucideIcon name={REBALANCE_DEVIATION_LUCIDE_ICON} size="md" />
    </div>
    <div class="min-w-0">
      <p class="text-xs text-base-content/60">Desvio total (faltando)</p>
      <p class="truncate text-base font-semibold">{formatBrl(totalGapBrl)}</p>
    </div>
  </div>

  <div class={cardClass} data-testid="rebalance-kpi-above-target">
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-success/10 text-success"
      aria-hidden="true"
    >
      <LucideIcon name={REBALANCE_ABOVE_TARGET_LUCIDE_ICON} size="md" />
    </div>
    <div class="min-w-0">
      <p class="text-xs text-base-content/60">Acima da meta</p>
      <p class="truncate text-base font-semibold">
        {aboveCount} {aboveCount === 1 ? 'classe' : 'classes'}
      </p>
    </div>
  </div>

  <div class={cardClass} data-testid="rebalance-kpi-below-target">
    <div
      class="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-error/10 text-error"
      aria-hidden="true"
    >
      <LucideIcon name={REBALANCE_BELOW_TARGET_LUCIDE_ICON} size="md" />
    </div>
    <div class="min-w-0">
      <p class="text-xs text-base-content/60">Abaixo da meta</p>
      <p class="truncate text-base font-semibold">
        {belowCount} {belowCount === 1 ? 'classe' : 'classes'}
      </p>
    </div>
  </div>
</div>
