<script lang="ts">
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  import {
    barHeightPercent,
    buildCashflowYAxisTicks,
    computeCashflowBalance,
    computeCashflowMaxValue,
    formatCashflowTooltipMonth,
    type CashflowTimelineRow
  } from './budgetCashflowChart';
  import { formatYearMonthChartLabel } from './budgetMonth';

  export let timeline: CashflowTimelineRow[] = [];
  export let title = 'Histórico financeiro';
  export let testId: string | undefined = 'budget-cashflow-chart';

  let hoveredRow: CashflowTimelineRow | null = null;
  let tooltipStyle = '';

  $: maxValue = computeCashflowMaxValue(timeline);
  $: yAxisTicks = [...buildCashflowYAxisTicks(maxValue)].reverse();
  $: hoveredBalance = hoveredRow
    ? computeCashflowBalance(hoveredRow.income_brl, hoveredRow.expense_brl)
    : 0;

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }

  function formatAxisValue(value: number): string {
    if ($hideMoneyValues) {
      return '••••';
    }
    return formatBrl(value);
  }

  function balanceClass(balance: number): string {
    if (balance >= 0) {
      return 'text-success';
    }
    return 'text-error';
  }

  function positionTooltip(element: HTMLElement) {
    const rect = element.getBoundingClientRect();
    tooltipStyle = `left:${rect.left + rect.width / 2}px;top:${rect.top}px;transform:translate(-50%, calc(-100% - 0.5rem));`;
  }

  function showTooltip(event: MouseEvent, row: CashflowTimelineRow) {
    hoveredRow = row;
    positionTooltip(event.currentTarget as HTMLElement);
  }

  function hideTooltip() {
    hoveredRow = null;
    tooltipStyle = '';
  }

  function handleScroll() {
    if (hoveredRow) {
      hideTooltip();
    }
  }
</script>

<svelte:window on:scroll={handleScroll} />

<section class="card bg-base-100 shadow" data-testid={testId} aria-label={title}>
  <div class="card-body gap-4">
    <div class="flex items-center gap-2">
      <span class="text-primary" aria-hidden="true">
        <LucideIcon name="ChartNoAxesColumn" size="md" />
      </span>
      <h3 class="card-title text-base">{title}</h3>
    </div>
    {#if timeline.length === 0}
      <p class="text-sm text-base-content/60">Sem histórico no período.</p>
    {:else}
      <div class="w-full overflow-x-auto">
        <div class="flex min-w-[20rem] gap-2">
          <div
            class="flex h-48 shrink-0 flex-col justify-between py-0.5 text-right text-[0.65rem] tabular-nums text-base-content/60 sm:text-xs"
            aria-hidden="true"
            data-testid="budget-cashflow-y-axis"
          >
            {#each yAxisTicks as tick (tick)}
              <span>{formatAxisValue(tick)}</span>
            {/each}
          </div>

          <div class="flex min-w-0 flex-1 items-end gap-1 sm:gap-2">
            {#each timeline as row (row.year_month)}
              {@const balance = computeCashflowBalance(row.income_brl, row.expense_brl)}
              <div
                class="relative flex min-w-[2.75rem] flex-1 flex-col items-center gap-1"
                on:mouseenter={(event) => showTooltip(event, row)}
                on:mouseleave={hideTooltip}
                on:focusin={(event) => showTooltip(event, row)}
                on:focusout={hideTooltip}
                tabindex="0"
                role="group"
                aria-label={`${formatCashflowTooltipMonth(row.year_month)}: receita ${formatValue(row.income_brl)}, saída ${formatValue(row.expense_brl)}, saldo ${formatValue(balance)}`}
                data-testid="budget-cashflow-month-{row.year_month}"
              >
                <div
                  class="flex h-48 w-full items-end justify-center gap-0.5 rounded px-0.5 transition-colors sm:gap-1 {hoveredRow?.year_month === row.year_month ? 'bg-base-200/80' : ''}"
                >
                  <div
                    class="w-full max-w-8 rounded-t bg-success"
                    style:height="{barHeightPercent(row.income_brl, maxValue)}%"
                  ></div>
                  <div
                    class="w-full max-w-8 rounded-t bg-error"
                    style:height="{barHeightPercent(row.expense_brl, maxValue)}%"
                  ></div>
                </div>
                <span
                  class="whitespace-nowrap text-center text-[0.65rem] leading-tight text-base-content/70 sm:text-xs"
                >
                  {formatYearMonthChartLabel(row.year_month)}
                </span>
              </div>
            {/each}
          </div>
        </div>
      </div>
      <div class="flex gap-4 text-xs">
        <span class="flex items-center gap-1"><span class="inline-block h-2 w-2 rounded bg-success"></span> Entrada</span>
        <span class="flex items-center gap-1"><span class="inline-block h-2 w-2 rounded bg-error"></span> Saída</span>
      </div>
    {/if}
  </div>
</section>

{#if hoveredRow}
  <div
    class="pointer-events-none fixed z-50 w-max max-w-[14rem] rounded-box border border-base-300 bg-neutral px-3 py-2 text-xs text-neutral-content shadow-lg"
    style={tooltipStyle}
    role="tooltip"
    data-testid="budget-cashflow-tooltip"
  >
    <p class="font-semibold text-warning">Mês: {formatCashflowTooltipMonth(hoveredRow.year_month)}</p>
    <p class="text-success">Receita: {formatValue(hoveredRow.income_brl)}</p>
    <p class="text-error">Saída: {formatValue(hoveredRow.expense_brl)}</p>
    <p class="mt-1 font-semibold {balanceClass(hoveredBalance)}">Saldo: {formatValue(hoveredBalance)}</p>
  </div>
{/if}
