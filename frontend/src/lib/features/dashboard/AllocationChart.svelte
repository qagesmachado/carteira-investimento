<script lang="ts">
  import { formatMoneyAmount } from '$lib/assetLabels';

  import {
    allocationBarClassForDisplayClass,
    allocationPieSliceClassForDisplayClass
  } from './allocationChartColors';
  import DashboardPatrimonyFilterCheckboxes from './DashboardPatrimonyFilterCheckboxes.svelte';
  import type { AllocationRow } from './portfolioDashboard';
  import type { DashboardPatrimonyFilterAvailability } from './dashboardPatrimonyScope';
  import { hasDashboardPatrimonyFilterOptions } from './dashboardPatrimonyScope';
  import {
    allocationToPieSegments,
    donutSegmentLabelPoint,
    donutSlicePath,
    shouldShowDonutSegmentLabel
  } from './topAssetsDashboard';

  export let rows: AllocationRow[] = [];
  export let filterAvailability: DashboardPatrimonyFilterAvailability = {
    hasNonInvestment: false,
    hasPension: false
  };

  $: showPatrimonyFilters = hasDashboardPatrimonyFilterOptions(filterAvailability);

  $: pieSegments = allocationToPieSegments(rows);
  $: totalBrl = rows.reduce((sum, row) => sum + row.valueBrl, 0);
  $: totalPercent = rows.reduce((sum, row) => sum + row.percent, 0);

  type HoveredSegment = (typeof pieSegments)[number];
  let hoveredSegment: HoveredSegment | null = null;
  let tooltipX = 0;
  let tooltipY = 0;
  let chartEl: HTMLDivElement;

  function formatPercent(value: number): string {
    return `${value.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}%`;
  }

  function formatSegmentTooltip(segment: HoveredSegment): string {
    return `${segment.label}: ${formatPercent(segment.percent)} · ${formatMoneyAmount(segment.valueBrl, 'BRL')}`;
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
    <div class="flex flex-wrap items-start justify-between gap-3">
      <h2 class="card-title text-lg">Alocação por classe</h2>
      {#if rows.length > 0 && showPatrimonyFilters}
        <DashboardPatrimonyFilterCheckboxes {filterAvailability} compact />
      {/if}
    </div>

    {#if rows.length === 0}
      <p class="text-sm text-base-content/60">Sem valor de mercado para calcular alocação.</p>
    {:else}
      <div class="flex flex-col items-center gap-6 lg:flex-row lg:items-center">
        <div
          bind:this={chartEl}
          class="relative h-56 w-56 shrink-0 sm:h-64 sm:w-64"
          on:mouseleave={hideSegmentTooltip}
        >
          <svg
            viewBox="0 0 100 100"
            class="h-full w-full"
            role="img"
            aria-label="Gráfico rosca de alocação por classe"
          >
            {#each pieSegments as segment}
              <path
                class="cursor-pointer {allocationPieSliceClassForDisplayClass(segment.displayClass)}"
                d={donutSlicePath(segment.startAngle, segment.endAngle)}
                stroke="oklch(var(--b1) / 1)"
                stroke-width="0.6"
                aria-label={formatSegmentTooltip(segment)}
                on:mouseenter={(event) => showSegmentTooltip(segment, event)}
                on:mousemove={positionTooltip}
              ></path>
            {/each}
            {#each pieSegments as segment}
              {@const labelPoint = donutSegmentLabelPoint(segment.startAngle, segment.endAngle)}
              {#if shouldShowDonutSegmentLabel(segment.percent, labelPoint.sweep)}
                <text
                  x={labelPoint.x}
                  y={labelPoint.y}
                  text-anchor="middle"
                  dominant-baseline="middle"
                  class="allocation-donut-label pointer-events-none select-none"
                  aria-hidden="true"
                >
                  {segment.percent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}%
                </text>
              {/if}
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

        <div class="min-w-0 flex-1 self-stretch">
          <table class="w-full border-collapse text-sm" data-testid="dashboard-allocation-legend">
            <tbody>
              {#each rows as row (row.displayClass)}
                <tr class="border-b border-base-200">
                  <td class="py-2 pr-3">
                    <span class="flex items-center gap-2">
                      <span
                        class="inline-block h-2.5 w-2.5 shrink-0 rounded-full {allocationBarClassForDisplayClass(row.displayClass)}"
                        aria-hidden="true"
                      ></span>
                      <a
                        class="link link-hover font-medium"
                        href="/portfolios/consolidada?display_class={row.displayClass}"
                      >
                        {row.label}
                      </a>
                    </span>
                  </td>
                  <td class="py-2 pr-3 text-right tabular-nums text-base-content/80">
                    {formatPercent(row.percent)}
                  </td>
                  <td class="py-2 text-right tabular-nums text-base-content/80">
                    {formatMoneyAmount(row.valueBrl, 'BRL')}
                  </td>
                </tr>
              {/each}
              <tr class="font-semibold text-base-content" data-testid="dashboard-allocation-total">
                <td class="border-t border-base-300 pt-3">Total</td>
                <td class="border-t border-base-300 pt-3 text-right tabular-nums">
                  {formatPercent(totalPercent)}
                </td>
                <td class="border-t border-base-300 pt-3 text-right tabular-nums">
                  {formatMoneyAmount(totalBrl, 'BRL')}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
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

  .allocation-donut-label {
    fill: #fff;
    font-size: 4.5px;
    font-weight: 600;
  }

  .allocation-pie-tooltip {
    transition: opacity 75ms ease-out;
  }

  path[class*='allocation-pie-']:hover {
    opacity: 0.92;
  }
</style>
