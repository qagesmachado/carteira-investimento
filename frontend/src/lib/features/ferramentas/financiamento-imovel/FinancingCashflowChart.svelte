<script lang="ts">

  import type { TimelineRow } from '$lib/api/propertyFinancings';

  import { formatBrl } from '$lib/features/rebalance/allocationTargets';



  import {

    computeCashflowBarRows,

    filterMonthlyTimelineByYear,

    listTimelineYears,

    pickTimelineRows,

    type CashflowTimelineMode

  } from './computeFinancingMetrics';



  export let monthlyTimeline: TimelineRow[] = [];

  export let annualTimeline: TimelineRow[] = [];

  export let title = 'Fluxo de caixa';



  let timelineMode: CashflowTimelineMode = 'monthly';

  let selectedYear = new Date().getFullYear();



  $: availableYears = listTimelineYears(
    monthlyTimeline.length > 0 ? monthlyTimeline : annualTimeline
  );

  $: if (availableYears.length > 0 && !availableYears.includes(Number(selectedYear))) {

    selectedYear = availableYears[availableYears.length - 1] ?? new Date().getFullYear();

  }

  $: baseRows = pickTimelineRows(monthlyTimeline, annualTimeline, timelineMode);

  $: displayRows =

    timelineMode === 'monthly'

      ? filterMonthlyTimelineByYear(baseRows, Number(selectedYear))

      : baseRows;

  $: barRows = computeCashflowBarRows(displayRows);

  $: hasData = displayRows.some(

    (row) => row.income_brl > 0 || row.expenses_brl > 0

  );

</script>



<section class="card bg-base-100 shadow" data-testid="financing-cashflow-chart">

  <div class="card-body gap-4">

    <div class="flex flex-wrap items-center justify-between gap-2">

      <h3 class="card-title text-base">{title}</h3>

      <div class="flex flex-wrap items-center gap-2">

        <div class="join">

          <button

            type="button"

            class="btn btn-xs join-item {timelineMode === 'annual' ? 'btn-active' : 'btn-outline'}"

            aria-pressed={timelineMode === 'annual'}

            data-testid="financing-chart-annual"

            on:click={() => (timelineMode = 'annual')}

          >

            Anual

          </button>

          <button

            type="button"

            class="btn btn-xs join-item {timelineMode === 'monthly' ? 'btn-active' : 'btn-outline'}"

            aria-pressed={timelineMode === 'monthly'}

            data-testid="financing-chart-monthly"

            on:click={() => (timelineMode = 'monthly')}

          >

            Mensal

          </button>

        </div>

        {#if timelineMode === 'monthly' && availableYears.length > 0}

          <select

            class="select select-bordered select-xs"

            aria-label="Ano"

            bind:value={selectedYear}

          >

            {#each availableYears as year}

              <option value={year}>{year}</option>

            {/each}

          </select>

        {/if}

      </div>

    </div>



    <div class="flex flex-wrap gap-4 text-xs">

      <span class="flex items-center gap-1">

        <span class="inline-block h-2 w-4 rounded bg-success"></span>

        Receitas

      </span>

      <span class="flex items-center gap-1">

        <span class="inline-block h-2 w-4 rounded bg-error"></span>

        Despesas

      </span>

    </div>



    {#if !hasData}

      <p class="text-sm text-base-content/60">Sem lançamentos no período selecionado.</p>

    {:else}

      <div class="flex flex-col gap-3">

        {#each barRows as barRow (barRow.row.label + String(barRow.row.month))}

          <div class="flex flex-col gap-1">

            <div class="flex flex-wrap items-baseline justify-between gap-2 text-sm">

              <span class="font-medium">{barRow.row.label}</span>

              <span class="text-base-content/70">

                Receitas {formatBrl(barRow.row.income_brl)} · Despesas{' '}

                {formatBrl(barRow.row.expenses_brl)}

              </span>

            </div>

            <div class="flex h-2 w-full overflow-hidden rounded-full bg-base-200">

              {#if barRow.row.income_brl > 0}

                <div

                  class="h-full bg-success"

                  style="width: {barRow.incomePercent}%"

                  role="presentation"

                ></div>

              {/if}

              {#if barRow.row.expenses_brl > 0}

                <div

                  class="h-full bg-error"

                  style="width: {barRow.expensesPercent}%"

                  role="presentation"

                ></div>

              {/if}

            </div>

          </div>

        {/each}

      </div>

    {/if}

  </div>

</section>

