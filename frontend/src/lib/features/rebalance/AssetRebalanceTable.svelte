<script lang="ts">
  import type { AssetRebalanceRow } from '$lib/api/rebalance';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { formatAssetTypeForDisplay } from '$lib/assetLabels';
  import { formatPercent, formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { filterAssetRebalanceRows } from '$lib/features/rebalance/filterRebalanceRows';
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
  export let filterText = '';

  let sortKey: AssetRebalanceSortKey = 'symbol';
  let sortDir: SortDirection = 'asc';

  $: columnCount = (showSumColumn ? 8 : 7) + 2;
  $: filteredRows = filterAssetRebalanceRows(rows, filterText);
  $: allocationMap =
    currentPatrimonyBrl != null &&
    finalPatrimonyBrl != null &&
    classContributionBrl != null &&
    classContributionBrl > 0
      ? computeAssetInvestmentAllocation(
          filteredRows,
          classContributionBrl,
          currentPatrimonyBrl,
          finalPatrimonyBrl
        )
      : null;
  $: displayedRows = sortAssetRebalanceRows(filteredRows, sortKey, sortDir, {
    currentPatrimonyBrl,
    finalPatrimonyBrl,
    classContributionBrl
  });

  $: if (!showSumColumn && sortKey === 'sum_score') {
    sortKey = 'symbol';
    sortDir = 'asc';
  }

  function headerSortClass(key: AssetRebalanceSortKey): string {
    return sortKey === key ? 'font-semibold text-base-content' : 'font-normal text-base-content/70';
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

<div
  class="w-full min-w-0 overflow-x-auto rounded-lg border border-base-300 bg-base-100 p-3 sm:px-4 sm:py-4"
  data-testid="rebalance-asset-table"
>
  <table class="table table-sm w-full min-w-[52rem]">
    <thead>
      <tr>
        <th>
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
              'symbol'
            )}"
            on:click={() => toggleSort('symbol')}
          >
            Ticker
            {#if sortKey === 'symbol'}
              <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
            {/if}
          </button>
        </th>
        <th>
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
              'asset_type'
            )}"
            on:click={() => toggleSort('asset_type')}
          >
            Tipo
            {#if sortKey === 'asset_type'}
              <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
            {/if}
          </button>
        </th>
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
              'current_value_brl'
            )}"
            on:click={() => toggleSort('current_value_brl')}
          >
            Valor atual
            {#if sortKey === 'current_value_brl'}
              <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
            {/if}
          </button>
        </th>
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
              'current_percent'
            )}"
            on:click={() => toggleSort('current_percent')}
          >
            % atual
            {#if sortKey === 'current_percent'}
              <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
            {/if}
          </button>
        </th>
        {#if showSumColumn}
          <th class="text-right">
            <button
              type="button"
              class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
                'sum_score'
              )}"
              on:click={() => toggleSort('sum_score')}
            >
              Soma
              {#if sortKey === 'sum_score'}
                <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
              {/if}
            </button>
          </th>
        {/if}
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
              'target_percent'
            )}"
            on:click={() => toggleSort('target_percent')}
          >
            % desejada
            {#if sortKey === 'target_percent'}
              <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
            {/if}
          </button>
        </th>
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
              'target_value_brl'
            )}"
            on:click={() => toggleSort('target_value_brl')}
          >
            Valor desejável
            {#if sortKey === 'target_value_brl'}
              <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
            {/if}
          </button>
        </th>
        <th class="text-right">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
              'gap_brl'
            )}"
            on:click={() => toggleSort('gap_brl')}
          >
            Faltando
            {#if sortKey === 'gap_brl'}
              <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
            {/if}
          </button>
        </th>
        <th class="text-right min-w-[10rem]">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
              'ideal_target'
            )}"
            on:click={() => toggleSort('ideal_target')}
          >
            Deveria ter
            {#if sortKey === 'ideal_target'}
              <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
            {/if}
          </button>
        </th>
        <th class="text-right min-w-[10rem]">
          <button
            type="button"
            class="btn btn-ghost btn-xs h-auto min-h-0 ml-auto gap-1 whitespace-nowrap px-1 normal-case {headerSortClass(
              'suggested_contribution'
            )}"
            on:click={() => toggleSort('suggested_contribution')}
          >
            Aporte sugerido
            {#if sortKey === 'suggested_contribution'}
              <LucideIcon name={sortDir === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" aria-hidden="true" />
            {/if}
          </button>
        </th>
      </tr>
    </thead>
    <tbody>
      {#each displayedRows as row (row.asset_id)}
        {@const allocation = allocationFor(row.asset_id)}
        <tr class="hover:bg-base-200/40">
          <td class="font-medium">{formatTickerForDisplay(row.symbol)}</td>
          <td class="text-base-content/80">{formatAssetTypeForDisplay(row.asset_type)}</td>
          <td class="text-right tabular-nums">
            {#if showUsdPrimary}
              <UsdPrimaryBrlTooltip brlValue={row.current_value_brl} {usdBrlRate} />
            {:else}
              {formatBrl(row.current_value_brl)}
            {/if}
          </td>
          <td class="text-right tabular-nums">{formatPercent(row.current_percent)}</td>
          {#if showSumColumn}
            <td class="text-right tabular-nums">
              {row.sum_score != null ? row.sum_score.toLocaleString('pt-BR') : '—'}
            </td>
          {/if}
          <td class="text-right tabular-nums">{formatPercent(row.target_percent)}</td>
          <td class="text-right tabular-nums">
            {#if showUsdPrimary}
              <UsdPrimaryBrlTooltip brlValue={row.target_value_brl} {usdBrlRate} />
            {:else}
              {formatBrl(row.target_value_brl)}
            {/if}
          </td>
          <td class="text-right tabular-nums">
            {#if showUsdPrimary}
              <UsdPrimaryBrlTooltip brlValue={row.gap_brl} {usdBrlRate} />
            {:else}
              {formatBrl(row.gap_brl)}
            {/if}
          </td>
          <td class="text-right tabular-nums">
            {#if showUsdPrimary}
              <UsdPrimaryBrlTooltip brlValue={allocation?.idealTargetBrl ?? null} {usdBrlRate} />
            {:else}
              {formatBrl(allocation?.idealTargetBrl ?? null)}
            {/if}
          </td>
          <td class="text-right tabular-nums">
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
          <td colspan={columnCount} class="text-center text-sm text-base-content/60">
            {emptyMessage}
          </td>
        </tr>
      {:else if filteredRows.length === 0}
        <tr>
          <td colspan={columnCount} class="text-center text-sm text-base-content/60">
            Nenhum ativo corresponde ao filtro.
          </td>
        </tr>
      {/if}
    </tbody>
  </table>
</div>
