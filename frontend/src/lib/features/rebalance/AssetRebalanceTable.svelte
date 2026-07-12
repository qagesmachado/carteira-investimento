<script lang="ts">
  import type { AssetRebalanceRow } from '$lib/api/rebalance';
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import { formatPercent, formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { computeAssetInvestmentAllocation } from '$lib/features/rebalance/investmentAllocation';
  import UsdPrimaryBrlTooltip from '$lib/features/rebalance/UsdPrimaryBrlTooltip.svelte';
  import {
    sortAssetRebalanceRows,
    type AssetRebalanceSortKey,
    type SortDirection
  } from '$lib/features/rebalance/sortAssetRebalanceRows';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  export let rows: AssetRebalanceRow[] = [];
  export let emptyMessage = 'Nenhuma posição nesta carteira.';
  export let showSumColumn = false;
  /** Patrimônio total após aporte; null ou ≤0 = colunas projetadas exibem «—». */
  export let finalPatrimonyBrl: number | null = null;
  /** Patrimônio atual da carteira (para escalar valor desejável). */
  export let currentPatrimonyBrl: number | null = null;
  /** Aporte sugerido para a classe da aba ativa. */
  export let classContributionBrl: number | null = null;
  /** Exibe valores monetários em USD (tooltip em BRL) — aba ETF internacional. */
  export let showUsdPrimary = false;
  export let usdBrlRate: number | null = null;

  let sortKey: AssetRebalanceSortKey = 'symbol';
  let sortDir: SortDirection = 'asc';

  $: columnCount = (showSumColumn ? 8 : 7) + 2;
  $: allocationMap =
    currentPatrimonyBrl != null &&
    finalPatrimonyBrl != null &&
    classContributionBrl != null &&
    classContributionBrl > 0
      ? computeAssetInvestmentAllocation(
          rows,
          classContributionBrl,
          currentPatrimonyBrl,
          finalPatrimonyBrl
        )
      : null;
  $: displayedRows = sortAssetRebalanceRows(rows, sortKey, sortDir, {
    currentPatrimonyBrl,
    finalPatrimonyBrl,
    classContributionBrl
  });

  $: if (!showSumColumn && sortKey === 'sum_score') {
    sortKey = 'symbol';
    sortDir = 'asc';
  }

  function headerSortClass(key: AssetRebalanceSortKey): string {
    return sortKey === key ? 'font-bold' : 'font-normal';
  }

  function toggleSort(key: AssetRebalanceSortKey) {
    if (sortKey === key) {
      sortDir = sortDir === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDir = 'asc';
    }
  }

  function allocationFor(assetId: number) {
    return allocationMap?.get(assetId) ?? null;
  }
</script>

<div class="overflow-x-auto">
  <table class="table table-sm">
    <thead>
      <tr>
        <th>
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
              'symbol'
            )}"
            on:click={() => toggleSort('symbol')}
          >
            Ticker
            {#if sortKey === 'symbol'}
              <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </button>
        </th>
        <th>
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
              'asset_type'
            )}"
            on:click={() => toggleSort('asset_type')}
          >
            Tipo
            {#if sortKey === 'asset_type'}
              <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </button>
        </th>
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
              'current_value_brl'
            )}"
            on:click={() => toggleSort('current_value_brl')}
          >
            Valor atual
            {#if sortKey === 'current_value_brl'}
              <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </button>
        </th>
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
              'current_percent'
            )}"
            on:click={() => toggleSort('current_percent')}
          >
            % atual
            {#if sortKey === 'current_percent'}
              <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </button>
        </th>
        {#if showSumColumn}
          <th class="text-right">
            <button
              type="button"
              class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
                'sum_score'
              )}"
              on:click={() => toggleSort('sum_score')}
            >
              Soma
              {#if sortKey === 'sum_score'}
                <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
              {/if}
            </button>
          </th>
        {/if}
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
              'target_percent'
            )}"
            on:click={() => toggleSort('target_percent')}
          >
            % desejada
            {#if sortKey === 'target_percent'}
              <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </button>
        </th>
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
              'target_value_brl'
            )}"
            on:click={() => toggleSort('target_value_brl')}
          >
            Valor desejável
            {#if sortKey === 'target_value_brl'}
              <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </button>
        </th>
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
              'gap_brl'
            )}"
            on:click={() => toggleSort('gap_brl')}
          >
            Faltando
            {#if sortKey === 'gap_brl'}
              <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </button>
        </th>
        <th class="text-right min-w-[10rem]">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
              'ideal_target'
            )}"
            on:click={() => toggleSort('ideal_target')}
          >
            Deveria ter
            {#if sortKey === 'ideal_target'}
              <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </button>
        </th>
        <th class="text-right min-w-[10rem]">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 font-normal normal-case {headerSortClass(
              'suggested_contribution'
            )}"
            on:click={() => toggleSort('suggested_contribution')}
          >
            Aporte sugerido
            {#if sortKey === 'suggested_contribution'}
              <span class="text-xs opacity-90" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
            {/if}
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each displayedRows as row (row.asset_id)}
        {@const allocation = allocationFor(row.asset_id)}
        <tr>
          <td>{formatTickerForDisplay(row.symbol)}</td>
          <td>{formatAssetTypeForDisplay(row.asset_type)}</td>
          <td class="text-right">
            {#if showUsdPrimary}
              <UsdPrimaryBrlTooltip brlValue={row.current_value_brl} {usdBrlRate} />
            {:else}
              {formatBrl(row.current_value_brl)}
            {/if}
          </td>
          <td class="text-right">{formatPercent(row.current_percent)}</td>
          {#if showSumColumn}
            <td class="text-right">
              {row.sum_score != null ? row.sum_score.toLocaleString('pt-BR') : '—'}
            </td>
          {/if}
          <td class="text-right">{formatPercent(row.target_percent)}</td>
          <td class="text-right">
            {#if showUsdPrimary}
              <UsdPrimaryBrlTooltip brlValue={row.target_value_brl} {usdBrlRate} />
            {:else}
              {formatBrl(row.target_value_brl)}
            {/if}
          </td>
          <td class="text-right">
            {#if showUsdPrimary}
              <UsdPrimaryBrlTooltip brlValue={row.gap_brl} {usdBrlRate} />
            {:else}
              {formatBrl(row.gap_brl)}
            {/if}
          </td>
          <td class="text-right">
            {#if showUsdPrimary}
              <UsdPrimaryBrlTooltip brlValue={allocation?.idealTargetBrl ?? null} {usdBrlRate} />
            {:else}
              {formatBrl(allocation?.idealTargetBrl ?? null)}
            {/if}
          </td>
          <td class="text-right">
            {#if showUsdPrimary}
              <UsdPrimaryBrlTooltip
                brlValue={allocation?.suggestedContributionBrl ?? null}
                {usdBrlRate}
              />
            {:else}
              {formatBrl(allocation?.suggestedContributionBrl ?? null)}
            {/if}
          </td>
        </tr>
      {/each}
      {#if rows.length === 0}
        <tr>
          <td colspan={columnCount} class="text-center text-sm opacity-70">
            {emptyMessage}
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
