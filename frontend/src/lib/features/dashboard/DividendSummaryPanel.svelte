<script lang="ts">
  import type { DividendPayment } from '$lib/api/dividendPayments';
  import { formatMoneyAmount } from '$lib/assetLabels';

  import { allocationBarClass } from './allocationChartColors';
  import {
    aggregateDividendsByMonth,
    aggregateDividendsByYear,
    computeDividendBarRows,
    getDividendPanelTitle,
    listPaymentYears,
    pickDefaultYear,
    type DividendSummaryRow,
    type DividendTimelineMode
  } from './dividendDashboard';

  export let payments: DividendPayment[] = [];
  export let usdBrlRate: number | null = null;

  type ViewMode = 'table' | 'chart';
  let timelineMode: DividendTimelineMode = 'annual';
  let viewMode: ViewMode = 'table';
  let selectedYear = new Date().getFullYear();

  $: availableYears = listPaymentYears(payments);
  $: if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
    selectedYear = pickDefaultYear(availableYears);
  }
  $: effectiveYear = availableYears.includes(selectedYear)
    ? selectedYear
    : pickDefaultYear(availableYears);
  $: summaryRows =
    timelineMode === 'annual'
      ? aggregateDividendsByYear(payments)
      : aggregateDividendsByMonth(payments, effectiveYear);
  $: barRows = computeDividendBarRows(summaryRows, usdBrlRate);
  $: panelTitle = getDividendPanelTitle(timelineMode, effectiveYear);
  $: periodColumnLabel = timelineMode === 'annual' ? 'Ano' : 'Mês';
  $: hasPayments = payments.length > 0;

  function formatTotals(row: DividendSummaryRow): string {
    if (row.count === 0) {
      return '—';
    }
    return Object.keys(row.totalByCurrency)
      .sort((a, b) => a.localeCompare(b, 'pt-BR'))
      .map((c) => formatMoneyAmount(row.totalByCurrency[c], c))
      .join(' · ');
  }
</script>

<section class="card bg-base-100 shadow" aria-label="Proventos no dashboard">
  <div class="card-body gap-4">
    <div class="flex flex-wrap items-center justify-between gap-2">
      <h2 class="card-title text-lg">Proventos {panelTitle}</h2>
      <div class="flex flex-wrap items-center gap-2">
        <div class="join">
          <button
            type="button"
            class="btn btn-xs join-item {timelineMode === 'annual' ? 'btn-active' : 'btn-outline'}"
            aria-pressed={timelineMode === 'annual'}
            on:click={() => (timelineMode = 'annual')}
          >
            Anual
          </button>
          <button
            type="button"
            class="btn btn-xs join-item {timelineMode === 'monthly' ? 'btn-active' : 'btn-outline'}"
            aria-pressed={timelineMode === 'monthly'}
            on:click={() => (timelineMode = 'monthly')}
          >
            Mensal
          </button>
        </div>
        {#if timelineMode === 'monthly' && availableYears.length > 0}
          <label class="flex items-center gap-1 text-xs">
            <span class="text-base-content/70">Ano</span>
            <select
              class="select select-bordered select-xs"
              aria-label="Ano"
              bind:value={selectedYear}
            >
              {#each availableYears as year}
                <option value={year}>{year}</option>
              {/each}
            </select>
          </label>
        {/if}
        {#if hasPayments}
          <div class="join">
            <button
              type="button"
              class="btn btn-xs join-item {viewMode === 'table' ? 'btn-active' : 'btn-outline'}"
              aria-pressed={viewMode === 'table'}
              on:click={() => (viewMode = 'table')}
            >
              Tabela
            </button>
            <button
              type="button"
              class="btn btn-xs join-item {viewMode === 'chart' ? 'btn-active' : 'btn-outline'}"
              aria-pressed={viewMode === 'chart'}
              on:click={() => (viewMode = 'chart')}
            >
              Barras
            </button>
          </div>
        {/if}
        <a class="btn btn-ghost btn-sm" href="/proventos">Ver todos</a>
      </div>
    </div>

    {#if !hasPayments}
      <p class="text-sm text-base-content/60">
        Nenhum provento registrado para os ativos desta carteira.
        <a class="link link-primary" href="/proventos">Cadastrar proventos</a>
      </p>
    {:else if viewMode === 'chart'}
      <div class="flex flex-col gap-3">
        {#each barRows as barRow, i}
          <div class="flex flex-col gap-1">
            <div class="flex flex-wrap items-baseline justify-between gap-2 text-sm">
              <span class="font-medium">{barRow.row.label}</span>
              <span class="text-base-content/70">
                {formatTotals(barRow.row)} · {barRow.row.count} lanç.
              </span>
            </div>
            <div class="h-2 w-full overflow-hidden rounded-full bg-base-200">
              <div
                class="h-full rounded-full {allocationBarClass(i)}"
                style="width: {Math.min(100, barRow.barPercent)}%"
                role="presentation"
              ></div>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="overflow-x-auto">
        <table class="table table-sm">
          <thead>
            <tr>
              <th>{periodColumnLabel}</th>
              <th>Total</th>
              <th>Lançamentos</th>
            </tr>
          </thead>
          <tbody>
            {#each summaryRows as row}
              <tr>
                <td>{row.label}</td>
                <td>{formatTotals(row)}</td>
                <td>{row.count}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    {/if}
  </div>
</section>
