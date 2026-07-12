<script lang="ts">
  import type { DashboardSlice } from '$lib/api/budget';
  import { formatMoneyAmount } from '$lib/assetLabels';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  import {
    BUDGET_PIE_CHART_EXPANDED_SIZE_CLASS,
    BUDGET_PIE_CHART_SIZE_CLASS,
    formatBudgetPieSliceTooltip,
    pieSlicePath,
    slicesToPieSegments,
    type BudgetPieSegment
  } from './budgetPieChart';

  export let title = 'Distribuição';
  export let slices: DashboardSlice[] = [];
  export let testId: string | undefined = undefined;
  export let expandable = false;
  export let chartSizeClass = BUDGET_PIE_CHART_SIZE_CLASS;

  let expandedOpen = false;
  let hoveredSegment: BudgetPieSegment | null = null;
  let tooltipX = 0;
  let tooltipY = 0;
  let chartEl: HTMLDivElement | undefined;
  let expandedChartEl: HTMLDivElement | undefined;
  let activeChartEl: HTMLDivElement | undefined;

  $: segments = slicesToPieSegments(slices);
  $: hasData = slices.some((slice) => slice.amount_brl > 0);
  $: tooltipTestId =
    activeChartEl === expandedChartEl && testId
      ? `${testId}-modal-tooltip`
      : testId
        ? `${testId}-tooltip`
        : undefined;

  function formatAmount(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatMoneyAmount(value, 'BRL');
  }

  function sliceTooltip(segment: BudgetPieSegment): string {
    return formatBudgetPieSliceTooltip(segment, formatAmount);
  }

  function showSegmentTooltip(
    segment: BudgetPieSegment,
    event: MouseEvent,
    container: HTMLDivElement | undefined
  ) {
    hoveredSegment = segment;
    activeChartEl = container;
    positionTooltip(event);
  }

  function positionTooltip(event: MouseEvent) {
    if (!activeChartEl) {
      return;
    }
    const rect = activeChartEl.getBoundingClientRect();
    tooltipX = event.clientX - rect.left + 10;
    tooltipY = event.clientY - rect.top + 10;
  }

  function hideSegmentTooltip() {
    hoveredSegment = null;
    activeChartEl = undefined;
  }

  function openExpanded() {
    expandedOpen = true;
    hideSegmentTooltip();
  }

  function closeExpanded() {
    expandedOpen = false;
    hideSegmentTooltip();
  }
</script>

<section class="card bg-base-100 shadow" data-testid={testId} aria-label={title}>
  <div class="card-body gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h3 class="card-title text-base">{title}</h3>
      {#if hasData && expandable}
        <button
          type="button"
          class="btn btn-ghost btn-xs"
          data-testid={testId ? `${testId}-expand` : undefined}
          aria-label="Ampliar gráfico"
          on:click={openExpanded}
        >
          Ampliar
        </button>
      {/if}
    </div>
    {#if !hasData}
      <p class="text-sm text-base-content/60">Sem lançamentos no período.</p>
    {:else}
      <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          bind:this={chartEl}
          class="relative shrink-0 {chartSizeClass}"
          on:mouseleave={hideSegmentTooltip}
          data-testid={testId ? `${testId}-pie` : undefined}
        >
          <svg viewBox="0 0 100 100" class="h-full w-full" role="img" aria-label={title}>
            {#each segments as segment (segment.id)}
              <path
                class="cursor-pointer transition-opacity hover:opacity-90 {hoveredSegment?.id === segment.id
                  ? 'opacity-90'
                  : ''}"
                d={pieSlicePath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                stroke="var(--fallback-b1,oklch(var(--b1)))"
                stroke-width="0.5"
                aria-label={sliceTooltip(segment)}
                on:mouseenter={(event) => showSegmentTooltip(segment, event, chartEl)}
                on:mousemove={positionTooltip}
              />
            {/each}
          </svg>
          {#if hoveredSegment && activeChartEl === chartEl}
            <div
              role="tooltip"
              class="pointer-events-none absolute z-10 max-w-[14rem] rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-xs leading-snug text-base-content shadow-lg"
              style="left: {tooltipX}px; top: {tooltipY}px;"
              data-testid={tooltipTestId}
            >
              {sliceTooltip(hoveredSegment)}
            </div>
          {/if}
        </div>
        <ul class="flex-1 space-y-2 text-sm" data-testid={testId ? `${testId}-legend` : undefined}>
          {#each slices as slice (slice.id)}
            <li class="flex items-center gap-2">
              <span class="inline-block h-3 w-3 shrink-0 rounded-full" style:background-color={slice.color}></span>
              <span class="flex-1">{slice.name}</span>
              <span class="tabular-nums">{formatAmount(slice.amount_brl)}</span>
              <span class="w-12 text-right tabular-nums text-base-content/70">
                {slice.percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
              </span>
            </li>
          {/each}
        </ul>
      </div>
    {/if}
  </div>
</section>

{#if expandedOpen && hasData}
  <dialog class="modal modal-open" aria-modal="true" data-testid={testId ? `${testId}-modal` : undefined}>
    <div class="modal-box max-w-2xl">
      <h3 class="text-lg font-bold">{title}</h3>
      <div class="mt-4 flex flex-col items-center gap-3 sm:flex-row sm:items-start">
        <div
          bind:this={expandedChartEl}
          class="relative shrink-0 {BUDGET_PIE_CHART_EXPANDED_SIZE_CLASS}"
          on:mouseleave={hideSegmentTooltip}
          data-testid={testId ? `${testId}-modal-pie` : undefined}
        >
          <svg viewBox="0 0 100 100" class="h-full w-full" role="img" aria-label="{title} ampliado">
            {#each segments as segment (segment.id)}
              <path
                class="cursor-pointer transition-opacity hover:opacity-90 {hoveredSegment?.id === segment.id
                  ? 'opacity-90'
                  : ''}"
                d={pieSlicePath(segment.startAngle, segment.endAngle)}
                fill={segment.color}
                stroke="var(--fallback-b1,oklch(var(--b1)))"
                stroke-width="0.5"
                aria-label={sliceTooltip(segment)}
                on:mouseenter={(event) => showSegmentTooltip(segment, event, expandedChartEl)}
                on:mousemove={positionTooltip}
              />
            {/each}
          </svg>
          {#if hoveredSegment && activeChartEl === expandedChartEl}
            <div
              role="tooltip"
              class="pointer-events-none absolute z-10 max-w-[14rem] rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-xs leading-snug text-base-content shadow-lg"
              style="left: {tooltipX}px; top: {tooltipY}px;"
              data-testid={tooltipTestId}
            >
              {sliceTooltip(hoveredSegment)}
            </div>
          {/if}
        </div>
        <ul class="flex-1 space-y-2 text-sm">
          {#each slices as slice (slice.id)}
            <li class="flex items-center gap-2">
              <span class="inline-block h-3 w-3 shrink-0 rounded-full" style:background-color={slice.color}></span>
              <span class="flex-1 font-medium">{slice.name}</span>
              <span class="tabular-nums">{formatAmount(slice.amount_brl)}</span>
              <span class="w-12 text-right tabular-nums text-base-content/70">
                {slice.percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%
              </span>
            </li>
          {/each}
        </ul>
      </div>
      <div class="modal-action">
        <button type="button" class="btn" data-testid={testId ? `${testId}-modal-close` : undefined} on:click={closeExpanded}>
          Fechar
        </button>
      </div>
    </div>
    <form method="dialog" class="modal-backdrop">
      <button type="button" aria-label="Fechar" on:click={closeExpanded}></button>
    </form>
  </dialog>
{/if}
