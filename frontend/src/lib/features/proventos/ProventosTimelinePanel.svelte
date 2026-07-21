<script lang="ts">
  import type { DividendPayment } from '$lib/api/dividendPayments';
  import { formatMoneyAmount } from '$lib/assetLabels';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import type { LucideIconName } from '$lib/icons/lucideIconCatalog';
  import { allocationBarClass } from '$lib/features/dashboard/allocationChartColors';
  import {
    aggregateDividendsByMonth,
    aggregateDividendsByYear,
    computeDividendBarRows,
    listPaymentYears,
    pickDefaultYear,
    type DividendSummaryRow
  } from '$lib/features/dashboard/dividendDashboard';

  export let payments: DividendPayment[] = [];
  export let mode: 'annual' | 'monthly' = 'annual';
  export let title = '';
  export let icon: LucideIconName;
  export let usdBrlRate: number | null = null;
  export let testId = '';

  let selectedYear = new Date().getFullYear();

  $: availableYears = listPaymentYears(payments);
  $: if (availableYears.length > 0 && !availableYears.includes(selectedYear)) {
    selectedYear = pickDefaultYear(availableYears);
  }
  $: effectiveYear = availableYears.includes(selectedYear)
    ? selectedYear
    : pickDefaultYear(availableYears);

  $: summaryRows =
    mode === 'annual'
      ? aggregateDividendsByYear(payments)
      : aggregateDividendsByMonth(payments, effectiveYear);
  $: barRows = computeDividendBarRows(summaryRows, usdBrlRate);
  $: hasData = barRows.some((barRow) => barRow.row.count > 0);

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

<PageSection {title} {testId}>
  <div slot="actions" class="flex items-center gap-2">
    <span class="text-primary" aria-hidden="true">
      <LucideIcon name={icon} size="md" />
    </span>
    {#if mode === 'monthly' && availableYears.length > 0}
      <label class="flex items-center gap-1 text-xs">
        <span class="text-base-content/70">Ano</span>
        <select
          class="select select-bordered select-xs"
          aria-label="Ano"
          bind:value={selectedYear}
        >
          {#each availableYears as year (year)}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </label>
    {/if}
  </div>

  {#if !hasData}
    <p class="text-sm text-base-content/70">
      {mode === 'annual' ? 'Nenhum provento no período.' : 'Nenhum provento neste ano.'}
    </p>
  {:else}
    <ul class="flex flex-col gap-3">
      {#each barRows as barRow, i (barRow.row.label)}
        <li class="flex flex-col gap-1">
          <div class="flex items-baseline justify-between gap-2 text-sm">
            <span class="font-medium">{barRow.row.label}</span>
            <span class="shrink-0 tabular-nums text-base-content/80">
              {formatTotals(barRow.row)}
            </span>
          </div>
          <div class="h-2 w-full overflow-hidden rounded-full bg-base-200">
            <div
              class="h-full rounded-full {allocationBarClass(i)}"
              style="width: {Math.min(100, Math.max(barRow.row.count > 0 ? 4 : 0, barRow.barPercent))}%"
              role="presentation"
            ></div>
          </div>
          <span class="text-xs text-base-content/50">{barRow.row.count} lanç.</span>
        </li>
      {/each}
    </ul>
  {/if}
</PageSection>
