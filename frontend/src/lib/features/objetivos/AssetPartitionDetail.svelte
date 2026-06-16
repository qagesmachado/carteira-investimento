<script lang="ts">
  import type { AssetPartition } from '$lib/api/objetivos';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  import { formatProfitBrl } from './formatAllocationProfit';
  import { formatSharesAllocation } from './formatSharesAllocation';
  import { isUserVisiblePartitionSlice } from './objectiveVisibility';

  export let partition: AssetPartition | null = null;

  function formatSliceAllocation(slice: AssetPartition['slices'][number]): string {
    if (!partition) return '—';
    if (partition.split_mode === 'amount') {
      return formatBrl(slice.amount);
    }
    return formatSharesAllocation(slice.quantity);
  }
</script>

{#if partition}
  <section class="rounded-box bg-base-100 p-4 shadow-sm" data-testid="objetivo-partition-detail">
    <h2 class="text-lg font-semibold">
      Partição — {formatTickerForDisplay(partition.symbol)}
    </h2>
    <p class="mb-4 text-sm opacity-70">{partition.name}</p>

    <div class="mb-4 grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
      <p>
        <span class="opacity-70">Total:</span>
        {partition.split_mode === 'amount'
          ? formatBrl(partition.position_total)
          : formatSharesAllocation(partition.position_total)}
      </p>
      <p><span class="opacity-70">Valor atual:</span> {formatBrl(partition.position_current_value_brl)}</p>
      <p><span class="opacity-70">Custo:</span> {formatBrl(partition.position_invested_value_brl)}</p>
      <p><span class="opacity-70">Lucro:</span> {formatProfitBrl(partition.position_profit_brl)}</p>
    </div>

    <div class="overflow-x-auto">
      <table class="table table-sm">
        <thead>
          <tr>
            <th>Objetivo</th>
            <th>Nome interno</th>
            <th>Fatia</th>
            <th>Custo (R$)</th>
            <th>Valor (R$)</th>
            <th>Lucro (R$)</th>
          </tr>
        </thead>
        <tbody>
          {#each partition.slices.filter(isUserVisiblePartitionSlice) as slice (`${slice.objective_id}-${slice.slice_name}`)}
            <tr data-testid={`partition-slice-${slice.objective_id}-${slice.slice_name}`}>
              <td>{slice.objective_name}</td>
              <td>{slice.is_default ? '—' : slice.slice_name}</td>
              <td>{formatSliceAllocation(slice)}</td>
              <td>{formatBrl(slice.invested_value_brl)}</td>
              <td>{formatBrl(slice.current_value_brl)}</td>
              <td>{formatProfitBrl(slice.profit_brl)}</td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </section>
{/if}
