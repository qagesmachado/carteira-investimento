<script lang="ts">
  import type { Asset } from '$lib/api/assets';
  import { formatAssetTypeForDisplay, formatCurrencyCodeForDisplay, formatDisplayClassForDisplay } from '$lib/assetLabels';
  import DividendTablePagination from '$lib/features/proventos/DividendTablePagination.svelte';
  import {
    DEFAULT_DIVIDEND_PAGE_SIZE,
    paginateList,
    type PageSizeOption
  } from '$lib/features/proventos/paginateList';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';

  import { filterAssets } from './filterAssets';

  export let assets: Asset[] = [];
  export let onEdit: (asset: Asset) => void = () => undefined;
  export let onDelete: (asset: Asset) => void = () => undefined;

  let searchQuery = '';
  let debouncedQuery = '';
  let currentPage = 1;
  let pageSize: PageSizeOption = DEFAULT_DIVIDEND_PAGE_SIZE;

  let debounceTimer: ReturnType<typeof setTimeout> | undefined;

  function resetPagination() {
    currentPage = 1;
  }

  function onSearchInput(event: Event) {
    const value = (event.target as HTMLInputElement).value;
    searchQuery = value;
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debouncedQuery = value;
      resetPagination();
    }, 200);
  }

  $: filteredAssets = filterAssets(assets, debouncedQuery);
  $: hasFilter = debouncedQuery.trim().length > 0;
  $: maxPage = Math.max(1, Math.ceil(filteredAssets.length / pageSize) || 1);
  $: if (currentPage > maxPage) {
    currentPage = maxPage;
  }
  $: pagination = paginateList(filteredAssets, { page: currentPage, pageSize });
  $: displayedAssets = pagination.items;
</script>

<section class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">Base local</p>
        <h2 class="card-title">Ativos cadastrados</h2>
      </div>
      <span class="badge badge-neutral">
        {#if hasFilter}
          {filteredAssets.length} de {assets.length} ativos
        {:else}
          {assets.length} ativos
        {/if}
      </span>
    </div>

    {#if assets.length > 0}
      <label class="form-control">
        <span class="label"><span class="label-text">Buscar por ticker ou nome</span></span>
        <input
          class="input input-bordered"
          type="search"
          placeholder="Ex.: EGIE3 ou Engie"
          value={searchQuery}
          on:input={onSearchInput}
        />
      </label>
    {/if}

    {#if assets.length === 0}
      <div class="alert">
        <span>Nenhum ativo cadastrado ainda.</span>
      </div>
    {:else if filteredAssets.length === 0}
      <div class="alert">
        <span>Nenhum ativo corresponde à busca.</span>
      </div>
    {:else}
      <DividendTablePagination
        position="top"
        bind:page={currentPage}
        bind:pageSize
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        ariaLabel="Paginação da tabela de ativos"
        emptyRangeLabel="Nenhum ativo na página"
      />

      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>Ticker</th>
              <th>Nome</th>
              <th>Tipo</th>
              <th>Classe</th>
              <th>Moeda</th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {#each displayedAssets as asset (asset.id)}
              <tr>
                <td class="font-semibold">{formatTickerForDisplay(asset.symbol)}</td>
                <td>{asset.name}</td>
                <td>{formatAssetTypeForDisplay(asset.asset_type)}</td>
                <td>{formatDisplayClassForDisplay(asset.display_class)}</td>
                <td>{formatCurrencyCodeForDisplay(asset.currency)}</td>
                <td class="text-end">
                  <div class="flex flex-wrap justify-end gap-2">
                    <button class="btn btn-sm btn-ghost" type="button" on:click={() => onEdit(asset)}>
                      Editar
                    </button>
                    <button class="btn btn-sm btn-error btn-outline" type="button" on:click={() => onDelete(asset)}>
                      Excluir
                    </button>
                  </div>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <DividendTablePagination
        position="bottom"
        bind:page={currentPage}
        bind:pageSize
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
        ariaLabel="Paginação da tabela de ativos"
        emptyRangeLabel="Nenhum ativo na página"
      />
    {/if}
  </div>
</section>
