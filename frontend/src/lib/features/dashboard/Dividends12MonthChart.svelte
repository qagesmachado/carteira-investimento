<script lang="ts">
  import type { DividendPayment } from '$lib/api/dividendPayments';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  import {
    buildDividendYearChartModel,
    formatYearOverYearChange,
    yearOverYearClass
  } from './dividendDashboard';

  export let payments: DividendPayment[] = [];
  export let usdBrlRate: number | null = null;

  $: chart = buildDividendYearChartModel(payments, usdBrlRate);
  $: hasPayments = payments.length > 0;
  $: yTickLabels = [...chart.yTicks].reverse();

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }
</script>

<section
  class="card bg-base-100 shadow"
  aria-label="Proventos no ano"
  data-testid="dashboard-dividends-12m"
>
  <div class="card-body gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="card-title text-lg">Proventos no ano {chart.year}</h2>
      <a
        class="btn btn-outline btn-sm"
        href="/proventos"
        data-testid="dashboard-dividends-12m-action"
      >
        Ver proventos
      </a>
    </div>

    {#if !hasPayments}
      <p class="text-sm text-base-content/60">
        Nenhum provento cadastrado.
        <a class="link link-primary" href="/proventos">Cadastrar proventos</a>
      </p>
    {:else}
      <div class="grid grid-cols-[auto_1fr] gap-x-2" data-testid="dashboard-dividends-year-chart">
        <div class="flex h-52 flex-col justify-between py-0.5 text-right text-[10px] tabular-nums text-base-content/60">
          {#each yTickLabels as tick (tick)}
            <span>{formatValue(tick)}</span>
          {/each}
        </div>

        <div class="relative h-52 border-b border-l border-base-300">
          {#each chart.yTicks as tick (tick)}
            <div
              class="pointer-events-none absolute left-0 right-0 border-t border-dashed border-base-300/70"
              style="bottom: {(tick / chart.yMax) * 100}%"
              aria-hidden="true"
            ></div>
          {/each}

          <div class="absolute inset-0 flex items-end justify-between gap-1 px-1 pb-0">
            {#each chart.points as point (point.month)}
              {@const barHeightPercent = Math.max(point.barPercent, point.amountBrl > 0 ? 4 : 0)}
              <div class="group relative flex h-full min-w-0 flex-1 flex-col items-center justify-end">
                <button
                  type="button"
                  class="relative flex h-full w-full max-w-8 items-end justify-center rounded-t bg-transparent p-0"
                  aria-label="{point.label}: {formatValue(point.amountBrl)}"
                >
                  <span
                    class="pointer-events-none absolute left-1/2 z-10 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-base-300 px-2 py-1 text-xs font-medium text-base-content shadow group-hover:block group-focus-within:block"
                    style="bottom: calc({barHeightPercent}% + 0.25rem)"
                    role="tooltip"
                  >
                    {point.label}: {formatValue(point.amountBrl)}
                  </span>
                  <span
                    class="w-full rounded-t bg-success transition-all group-hover:bg-success/80"
                    style="height: {barHeightPercent}%"
                  ></span>
                </button>
              </div>
            {/each}
          </div>
        </div>

        <div></div>
        <div
          class="grid grid-cols-12 gap-1 text-center text-[10px] text-base-content/60"
          data-testid="dashboard-dividends-year-month-labels"
        >
          {#each chart.points as point (point.month)}
            <span class="min-w-0 truncate">{point.label}</span>
          {/each}
        </div>
      </div>

      <div class="space-y-1 text-sm text-base-content/70">
        <p>
          Total{#if chart.throughMonth < 12} ({chart.comparisonPeriodLabel}){/if}:
          <span class="font-semibold" data-testid="dashboard-dividends-year-total">{formatValue(chart.totalBrl)}</span>
        </p>
        <p data-testid="dashboard-dividends-year-comparison">
          Ano anterior ({chart.year - 1}){#if chart.comparisonPeriodLabel}, {chart.comparisonPeriodLabel}{/if}:
          <span class="font-semibold">{formatValue(chart.previousYearTotalBrl)}</span>
          ·
          <span class={yearOverYearClass(chart.yearOverYearPercent)}>
            {formatYearOverYearChange(chart.yearOverYearPercent)}
          </span>
        </p>
      </div>
    {/if}
  </div>
</section>
