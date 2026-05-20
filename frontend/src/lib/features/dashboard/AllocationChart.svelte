<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';

  import {
    allocationBarClass,
    allocationPieSliceClass
  } from './allocationChartColors';
  import type { AllocationRow } from './portfolioDashboard';
  import { allocationToPieSegments, pieSlicePath } from './topAssetsDashboard';

  export let rows: AllocationRow[] = [];

  type ViewMode = 'list' | 'pie';
  let viewMode: ViewMode = 'list';

  $: pieSegments = allocationToPieSegments(rows);

  type HoveredSegment = (typeof pieSegments)[number];
  let hoveredSegment: HoveredSegment | null = null;
  let tooltipX = 0;
  let tooltipY = 0;
  let chartEl: HTMLDivElement;

  function formatSegmentTooltip(segment: HoveredSegment): string {
    const pct = segment.percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 });
    return `${segment.label}: ${pct}% · ${formatMoneyAmount(segment.valueBrl, 'BRL')}`;
  }

  function showSegmentTooltip(segment: HoveredSegment, event: MouseEvent) {
    hoveredSegment = segment;
    positionTooltip(event);
  }

  function positionTooltip(event: MouseEvent) {
    if (!chartEl) {
      return;
    }
    const rect = chartEl.getBoundingClientRect();
    tooltipX = event.clientX - rect.left + 10;
    tooltipY = event.clientY - rect.top + 10;
  }

  function hideSegmentTooltip() {
    hoveredSegment = null;
  }
</script>

<section class="card bg-base-100 shadow" aria-label="Alocação por classe">
  <div class="card-body gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="card-title text-lg">Alocação por classe</h2>
      {#if rows.length > 0}
        <div class="join">
          <button
            type="button"
            class="btn btn-xs join-item {viewMode === 'list' ? 'btn-active' : 'btn-outline'}"
            aria-pressed={viewMode === 'list'}
            on:click={() => (viewMode = 'list')}
          >
            Barras
          </button>
          <button
            type="button"
            class="btn btn-xs join-item {viewMode === 'pie' ? 'btn-active' : 'btn-outline'}"
            aria-pressed={viewMode === 'pie'}
            on:click={() => (viewMode = 'pie')}
          >
            Pizza
          </button>
        </div>
      {/if}
    </div>

    {#if rows.length === 0}
      <p class="text-sm text-base-content/60">Sem valor de mercado para calcular alocação.</p>
    {:else if viewMode === 'pie'}
      <div class="flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div
          bind:this={chartEl}
          class="relative h-44 w-44 shrink-0"
          on:mouseleave={hideSegmentTooltip}
        >
          <svg
            viewBox="0 0 100 100"
            class="h-full w-full"
            role="img"
            aria-label="Gráfico pizza de alocação por classe"
          >
            {#each pieSegments as segment}
              <path
                class="cursor-pointer {allocationPieSliceClass(segment.colorIndex)}"
                d={pieSlicePath(segment.startAngle, segment.endAngle)}
                stroke="oklch(var(--b1) / 1)"
                stroke-width="0.5"
                aria-label={formatSegmentTooltip(segment)}
                on:mouseenter={(event) => showSegmentTooltip(segment, event)}
                on:mousemove={positionTooltip}
              ></path>
            {/each}
          </svg>
          {#if hoveredSegment}
            <div
              role="tooltip"
              class="allocation-pie-tooltip pointer-events-none absolute z-10 max-w-[14rem] rounded-md border border-base-300 bg-base-100 px-2.5 py-1.5 text-xs leading-snug text-base-content shadow-lg"
              style="left: {tooltipX}px; top: {tooltipY}px;"
            >
              {formatSegmentTooltip(hoveredSegment)}
            </div>
          {/if}
        </div>
        <ul class="flex min-w-0 flex-1 flex-col gap-2 text-sm">
          {#each rows as row, i}
            <li class="flex flex-wrap items-baseline justify-between gap-2">
              <span class="flex items-center gap-2">
                <span
                  class="inline-block h-3 w-3 shrink-0 rounded-sm {allocationBarClass(i)}"
                  aria-hidden="true"
                ></span>
                <a
                  class="link link-hover font-medium"
                  href="/portfolios/consolidada?display_class={row.displayClass}"
                >
                  {row.label}
                </a>
              </span>
              <span class="text-base-content/70">
                {row.percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% ·
                {formatMoneyAmount(row.valueBrl, 'BRL')}
              </span>
            </li>
          {/each}
        </ul>
      </div>
    {:else}
      <div class="flex flex-col gap-3">
        {#each rows as row, i}
          <div class="flex flex-col gap-1">
            <div class="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <a
                class="link link-hover font-medium"
                href="/portfolios/consolidada?display_class={row.displayClass}"
              >
                {row.label}
              </a>
              <span class="text-base-content/70">
                {row.percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% ·
                {formatMoneyAmount(row.valueBrl, 'BRL')}
              </span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-base-200">
              <div
                class="h-full rounded-full {allocationBarClass(i)}"
                style="width: {Math.min(100, row.percent)}%"
                role="presentation"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    {/if}
  </div>
</section>

<style>
  .allocation-pie-0 {
    fill: oklch(var(--p) / 1);
  }
  .allocation-pie-1 {
    fill: oklch(var(--s) / 1);
  }
  .allocation-pie-2 {
    fill: oklch(var(--a) / 1);
  }
  .allocation-pie-3 {
    fill: oklch(var(--in) / 1);
  }
  .allocation-pie-4 {
    fill: oklch(var(--su) / 1);
  }
  .allocation-pie-5 {
    fill: oklch(var(--wa) / 1);
  }
  .allocation-pie-6 {
    fill: oklch(var(--n) / 1);
  }

  .allocation-pie-tooltip {
    transition: opacity 75ms ease-out;
  }

  path[class*='allocation-pie-']:hover {
    opacity: 0.92;
  }
</style>
