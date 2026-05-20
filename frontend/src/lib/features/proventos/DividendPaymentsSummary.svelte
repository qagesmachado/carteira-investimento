<script lang="ts">
  import type { DividendAssetTotals } from './dividendSummary';
  import {
    formatDividendPaymentsTotalAmounts,
    formatDividendPaymentsTotalLabel
  } from './dividendSummary';

  export let totals: DividendAssetTotals;
</script>

<div class="rounded-lg bg-base-200 px-4 py-3">
  <div class="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm font-semibold">{formatDividendPaymentsTotalLabel(totals)}</p>
    <p class="text-sm tabular-nums text-base-content/90">
      {formatDividendPaymentsTotalAmounts(totals)}
      {#if Object.keys(totals.totalByCurrency).length > 0}
        <span class="text-base-content/60">
          · {Object.keys(totals.totalByCurrency).sort().join(' · ')}
        </span>
      {/if}
    </p>
  </div>
</div>
