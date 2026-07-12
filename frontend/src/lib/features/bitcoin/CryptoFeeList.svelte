<script lang="ts">
  import type { CryptoFee, CryptoFeeType } from '$lib/api/cryptoFees';
  import { formatMoneyAmount } from '$lib/assetLabels';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import DividendTablePagination from '$lib/features/proventos/DividendTablePagination.svelte';
  import {
    DEFAULT_DIVIDEND_PAGE_SIZE,
    paginateList,
    type PageSizeOption
  } from '$lib/features/proventos/paginateList';

  import { computeBtcQuoteUsd } from './computeBtcQuoteUsd';
  import {
    cryptoFeeTypeOptions,
    formatBtcQuantity,
    formatCryptoFeeTypeForDisplay,
    formatCryptoFeeTypeShort,
    formatFeePercent
  } from './cryptoFeeLabels';
  import { filterCryptoFeesByType } from './filterCryptoFeesByType';
  import {
    sortCryptoFees,
    toggleSortDirection,
    type CryptoFeeSortKey,
    type SortDirection
  } from './sortCryptoFees';

  export let fees: CryptoFee[] = [];
  export let onEdit: (fee: CryptoFee) => void = () => undefined;
  export let onDelete: (fee: CryptoFee) => void = () => undefined;

  const SORT_HEADER_CLASS =
    'btn btn-ghost btn-xs h-auto min-h-0 gap-0.5 whitespace-nowrap px-0 font-normal normal-case';
  const NUM_CELL_CLASS = 'px-1 text-end text-xs tabular-nums whitespace-nowrap';

  let filterType: '' | CryptoFeeType = '';
  let sortKey: CryptoFeeSortKey = 'fee_date';
  let sortDirection: SortDirection = 'desc';
  let currentPage = 1;
  let pageSize: PageSizeOption = DEFAULT_DIVIDEND_PAGE_SIZE;

  function resetPagination() {
    currentPage = 1;
  }

  function handleTypeFilterChange(event: Event) {
    filterType = (event.target as HTMLSelectElement).value as '' | CryptoFeeType;
    resetPagination();
  }

  function handleSort(key: CryptoFeeSortKey) {
    if (sortKey === key) {
      sortDirection = toggleSortDirection(sortDirection);
    } else {
      sortKey = key;
      sortDirection = key === 'fee_date' ? 'desc' : 'asc';
    }
    resetPagination();
  }

  function headerSortClass(key: CryptoFeeSortKey): string {
    return sortKey === key ? 'font-semibold' : 'font-normal';
  }

  function sortArrow(key: CryptoFeeSortKey): string {
    if (sortKey !== key) {
      return '';
    }
    return sortDirection === 'asc' ? '▲' : '▼';
  }

  function formatDate(isoDate: string): string {
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) {
      return isoDate;
    }
    return `${d}/${m}/${y}`;
  }

  $: filtered = filterCryptoFeesByType(fees, filterType);
  $: sorted = sortCryptoFees(filtered, sortKey, sortDirection);
  $: maxPage = Math.max(1, Math.ceil(sorted.length / pageSize) || 1);
  $: if (currentPage > maxPage) {
    currentPage = maxPage;
  }
  $: pagination = paginateList(sorted, { page: currentPage, pageSize });
  $: displayed = pagination.items;
  $: hasTypeFilter = Boolean(filterType);
</script>

<div data-testid="crypto-fee-list">
  <div class="mb-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
    <h2 class="text-lg font-semibold">Histórico de taxas</h2>
    {#if fees.length > 0}
      <span class="badge badge-neutral">
        {#if hasTypeFilter}
          {filtered.length} de {fees.length} taxas
        {:else}
          {fees.length} taxas
        {/if}
      </span>
    {/if}
  </div>

  {#if fees.length === 0}
    <p class="text-sm opacity-70">Nenhuma taxa registrada.</p>
  {:else}
    <div class="mb-3 grid gap-3 sm:max-w-xs">
      <label class="form-control">
        <span class="label-text">Filtrar por tipo</span>
        <select
          class="select select-bordered select-sm"
          data-testid="crypto-fee-filter-type"
          value={filterType}
          on:change={handleTypeFilterChange}
        >
          <option value="">Todos os tipos</option>
          {#each cryptoFeeTypeOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>
    </div>

    {#if filtered.length === 0}
      <p class="text-sm opacity-70">Nenhuma taxa corresponde ao filtro aplicado.</p>
    {:else}
      <DividendTablePagination
        position="top"
        bind:page={currentPage}
        bind:pageSize
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        ariaLabel="Paginação do histórico de taxas"
        emptyRangeLabel="Nenhuma taxa na página"
      />

      <table class="table table-xs table-zebra w-full">
        <thead>
          <tr class="text-xs">
            <th class="px-1">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} {headerSortClass('fee_date')}"
                title="Data"
                on:click={() => handleSort('fee_date')}
              >
                Data
                {#if sortKey === 'fee_date'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('fee_date')}</span>
                {/if}
              </button>
            </th>
            <th class="px-1">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} {headerSortClass('fee_type')}"
                title="Tipo"
                on:click={() => handleSort('fee_type')}
              >
                Tipo
                {#if sortKey === 'fee_type'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('fee_type')}</span>
                {/if}
              </button>
            </th>
            <th class="px-1 text-end">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} ml-auto {headerSortClass('quantity_moved')}"
                title="Quantidade movimentada (BTC)"
                on:click={() => handleSort('quantity_moved')}
              >
                Mov.
                {#if sortKey === 'quantity_moved'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('quantity_moved')}</span>
                {/if}
              </button>
            </th>
            <th class="px-1 text-end">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} ml-auto {headerSortClass('fee_quantity_btc')}"
                title="Taxa (BTC)"
                on:click={() => handleSort('fee_quantity_btc')}
              >
                Taxa
                {#if sortKey === 'fee_quantity_btc'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('fee_quantity_btc')}</span>
                {/if}
              </button>
            </th>
            <th class="px-1 text-end">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} ml-auto {headerSortClass('final_quantity_after_fee')}"
                title="Final (BTC)"
                on:click={() => handleSort('final_quantity_after_fee')}
              >
                Final
                {#if sortKey === 'final_quantity_after_fee'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('final_quantity_after_fee')}</span>
                {/if}
              </button>
            </th>
            <th class="px-1 text-end">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} ml-auto {headerSortClass('fee_value_brl')}"
                title="Valor da taxa (R$)"
                on:click={() => handleSort('fee_value_brl')}
              >
                Vlr R$
                {#if sortKey === 'fee_value_brl'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('fee_value_brl')}</span>
                {/if}
              </button>
            </th>
            <th class="px-1 text-end">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} ml-auto {headerSortClass('fee_value_usd')}"
                title="Valor da taxa (US$)"
                on:click={() => handleSort('fee_value_usd')}
              >
                Vlr US$
                {#if sortKey === 'fee_value_usd'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('fee_value_usd')}</span>
                {/if}
              </button>
            </th>
            <th class="px-1 text-end">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} ml-auto {headerSortClass('quote_brl')}"
                title="Cotação BTC (R$)"
                on:click={() => handleSort('quote_brl')}
              >
                Cot R$
                {#if sortKey === 'quote_brl'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('quote_brl')}</span>
                {/if}
              </button>
            </th>
            <th class="px-1 text-end">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} ml-auto {headerSortClass('quote_usd')}"
                title="Cotação BTC (US$)"
                on:click={() => handleSort('quote_usd')}
              >
                Cot US$
                {#if sortKey === 'quote_usd'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('quote_usd')}</span>
                {/if}
              </button>
            </th>
            <th class="px-1 text-end">
              <button
                type="button"
                class="{SORT_HEADER_CLASS} ml-auto {headerSortClass('fee_percent')}"
                title="Percentual da taxa"
                on:click={() => handleSort('fee_percent')}
              >
                %
                {#if sortKey === 'fee_percent'}
                  <span class="text-[0.65rem] opacity-80" aria-hidden="true">{sortArrow('fee_percent')}</span>
                {/if}
              </button>
            </th>
            <th class="w-0 px-1"></th>
          </tr>
        </thead>
        <tbody>
          {#each displayed as fee (fee.id)}
            <tr data-testid={`crypto-fee-row-${fee.id}`} class="text-xs">
              <td class="px-1 whitespace-nowrap">{formatDate(fee.fee_date)}</td>
              <td class="px-1 whitespace-nowrap" title={formatCryptoFeeTypeForDisplay(fee.fee_type)}>
                {formatCryptoFeeTypeShort(fee.fee_type)}
              </td>
              <td class={NUM_CELL_CLASS}>{formatBtcQuantity(fee.quantity_moved)}</td>
              <td class={NUM_CELL_CLASS}>{formatBtcQuantity(fee.fee_quantity_btc)}</td>
              <td class={NUM_CELL_CLASS}>{formatBtcQuantity(fee.final_quantity_after_fee)}</td>
              <td class={NUM_CELL_CLASS}>{formatBrl(fee.fee_value_brl)}</td>
              <td class={NUM_CELL_CLASS}>{formatMoneyAmount(fee.fee_value_usd, 'USD')}</td>
              <td class={NUM_CELL_CLASS}>{formatBrl(fee.quote_brl)}</td>
              <td class={NUM_CELL_CLASS}>
                {formatMoneyAmount(computeBtcQuoteUsd(fee.quote_brl, fee.fx_rate), 'USD')}
              </td>
              <td class={NUM_CELL_CLASS}>{formatFeePercent(fee.fee_percent)}</td>
              <td class="px-1 text-end align-middle">
                <div class="flex flex-col items-end gap-0 leading-tight">
                  <button
                    class="btn btn-link btn-xs h-auto min-h-0 px-0 py-0"
                    type="button"
                    on:click={() => onEdit(fee)}
                  >
                    Editar
                  </button>
                  <button
                    class="btn btn-link btn-xs h-auto min-h-0 px-0 py-0 text-error"
                    type="button"
                    data-testid={`crypto-fee-delete-${fee.id}`}
                    on:click={() => onDelete(fee)}
                  >
                    Excluir
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>

      <DividendTablePagination
        position="bottom"
        bind:page={currentPage}
        bind:pageSize
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        ariaLabel="Paginação do histórico de taxas"
        emptyRangeLabel="Nenhuma taxa na página"
      />
    {/if}
  {/if}
</div>
