<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    displayClassIconFgClass,
    lucideIconForDisplayClass
  } from '$lib/features/dashboard/displayClassLucideIcons';
  import {
    allocationBarClassForDisplayClass,
    buildAllocationConicGradient
  } from '$lib/features/dashboard/allocationChartColors';
  import {
    buildPortfolioAllocationClassRows,
    formatStocksSplitLabel
  } from '$lib/features/portfolios/portfolioAllocationDisplay';
  import type { AllocationTargets } from '$lib/features/rebalance/allocationTargets';
  import { MIN_REBALANCE_TARGET_PERCENT } from '$lib/features/rebalance/rebalanceVisibility';

  export let targets: AllocationTargets;

  $: classRows = buildPortfolioAllocationClassRows(targets).filter((row) => row.value > 0);
  $: donutGradient = buildAllocationConicGradient(
    classRows.map((row) => ({ percent: row.value, displayClass: row.key }))
  );
  $: classSum = classRows.reduce((sum, row) => sum + row.value, 0);
  $: classSumValid = Math.abs(classSum - 100) <= 0.01;
  $: splitSum = targets.stocks_split.etf + targets.stocks_split.stock;
  $: splitSumValid = Math.abs(splitSum - 100) <= 0.01;
  $: showStocksSplitInfo = targets.classes.stocks >= MIN_REBALANCE_TARGET_PERCENT;
  $: stocksSplitLabel = formatStocksSplitLabel(targets);

  function iconSurfaceClass(displayClass: string): string {
    return `${allocationBarClassForDisplayClass(displayClass)}/15`;
  }
</script>

<section
  class="rounded-xl border border-base-300/80 bg-gradient-to-br from-base-200/80 to-base-100/40 p-4"
  data-testid="rebalance-targets-preview"
>
  <p class="text-xs font-semibold uppercase tracking-wide text-base-content/60">
    Pré-visualização
  </p>
  <p class="mt-1 text-sm text-base-content/70">
    Distribuição alvo das classes configuradas.
  </p>

  <div class="mt-4 flex flex-col items-center gap-4">
    <div
      class="relative flex h-40 w-40 shrink-0 items-center justify-center rounded-full border border-base-300/60 bg-base-100 shadow-inner sm:h-44 sm:w-44"
      data-testid="rebalance-targets-donut"
      style:background={donutGradient || 'oklch(var(--b3) / 0.5)'}
      aria-hidden="true"
    >
      <div class="flex h-24 w-24 flex-col items-center justify-center rounded-full bg-base-100 text-center shadow-sm sm:h-28 sm:w-28">
        <span class="text-[10px] uppercase tracking-wide text-base-content/60">Total</span>
        <span
          class="text-lg font-semibold tabular-nums {classSumValid ? 'text-success' : 'text-error'}"
          data-testid="rebalance-targets-class-sum"
        >
          {classSum.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%
        </span>
      </div>
    </div>

    <ul class="w-full space-y-2" data-testid="rebalance-targets-legend">
      {#each classRows as row (row.key)}
        {@const iconName = lucideIconForDisplayClass(row.key)}
        {@const iconFg = displayClassIconFgClass(row.key)}
        {@const iconBg = iconSurfaceClass(row.key)}
        {@const barClass = allocationBarClassForDisplayClass(row.key)}
        <li class="flex items-center gap-2.5 rounded-lg border border-base-300/50 bg-base-100/70 px-3 py-2">
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg {iconBg}"
            aria-hidden="true"
          >
            <LucideIcon name={iconName} size="sm" class={iconFg} />
          </span>
          <span class="min-w-0 flex-1 truncate text-sm text-base-content/80">{row.label}</span>
          <span class="font-semibold tabular-nums text-base-content">{row.percent}</span>
          <span class="h-1.5 w-12 overflow-hidden rounded-full bg-base-300/70" aria-hidden="true">
            <span class="block h-full rounded-full {barClass}" style="width: {row.value}%"></span>
          </span>
        </li>
      {/each}
    </ul>
  </div>

  <div class="mt-4 space-y-2 border-t border-base-300/60 pt-3 text-sm">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <span class="text-base-content/70">Soma das classes</span>
      <span
        class="badge badge-sm {classSumValid ? 'badge-success' : 'badge-error'}"
        data-testid="rebalance-targets-class-badge"
      >
        {classSum.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%
      </span>
    </div>
    {#if showStocksSplitInfo}
      <div class="flex flex-wrap items-center justify-between gap-2">
        <span class="text-base-content/70">ETF / Ação (BR)</span>
        <span
          class="badge badge-sm {targets.stocks_split_mode === 'unified' || splitSumValid ? 'badge-success' : 'badge-error'}"
          data-testid="rebalance-targets-split-badge"
        >
          {targets.stocks_split_mode === 'unified'
            ? 'Conjunto único'
            : stocksSplitLabel.replace('ETF/Ação (BR): ', '')}
        </span>
      </div>
    {/if}
  </div>

  <p class="mt-3 text-xs text-base-content/60">
    Classes com meta abaixo de 1% ficam ocultas na tela de rebalanceamento.
  </p>
</section>
