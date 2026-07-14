<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { AssetType, DisplayClass } from '$lib/api/assets';
  import { formatAssetTypeForDisplay, formatDisplayClassForDisplay } from '$lib/assetLabels';
  import type { DashboardPatrimonyFilterAvailability } from '$lib/features/dashboard/dashboardPatrimonyScope';
  import { hasDashboardPatrimonyFilterOptions } from '$lib/features/dashboard/dashboardPatrimonyScope';

  import {
    buildConsolidadaFilterChips,
    FILTER_DISPLAY_CLASS_NATIONAL,
    hasActiveConsolidadaFilters,
    type ConsolidadaFilterState
  } from './consolidadaFilterState';

  export let filterState: ConsolidadaFilterState;
  /** Estado efetivo para chips (patrimônio sanitizado conforme disponibilidade na carteira). */
  export let chipsFilterState: ConsolidadaFilterState = filterState;
  export let assetTypes: AssetType[] = [];
  export let displayClasses: DisplayClass[] = [];
  export let filterAvailability: DashboardPatrimonyFilterAvailability = {
    hasNonInvestment: false,
    hasPension: false
  };

  const dispatch = createEventDispatcher<{
    chipRemove: string;
    clearAll: void;
  }>();

  $: chips = buildConsolidadaFilterChips(chipsFilterState);
  $: showClear = hasActiveConsolidadaFilters(chipsFilterState);
  $: showPatrimonyFilters = hasDashboardPatrimonyFilterOptions(filterAvailability);
</script>

<div class="flex flex-wrap gap-3">
  <label class="form-control min-w-[12rem] flex-1">
    <span class="label-text">Buscar</span>
    <input
      class="input input-bordered input-sm"
      placeholder="Ticker, nome, tipo (ex.: ETF)…"
      bind:value={filterState.filterText}
      data-testid="consolidada-filter-text"
    />
  </label>
  <label class="form-control w-44">
    <span class="label-text">Tipo</span>
    <select
      class="select select-bordered select-sm"
      bind:value={filterState.filterAssetTypeStr}
      data-testid="consolidada-filter-asset-type"
    >
      <option value="">Todos</option>
      {#each assetTypes as assetType}
        <option value={assetType}>{formatAssetTypeForDisplay(assetType)}</option>
      {/each}
    </select>
  </label>
  <label class="form-control min-w-[12rem] sm:w-52">
    <span class="label-text">Classe de exibição</span>
    <select
      class="select select-bordered select-sm"
      bind:value={filterState.filterDisplayClassStr}
      data-testid="consolidada-filter-display-class"
    >
      <option value="">Todas</option>
      <option value={FILTER_DISPLAY_CLASS_NATIONAL}>Nacional</option>
      {#each displayClasses as displayClass}
        <option value={displayClass}>{formatDisplayClassForDisplay(displayClass)}</option>
      {/each}
    </select>
  </label>
  <label class="form-control min-w-[8rem] w-40">
    <span class="label-text">Moeda</span>
    <input
      class="input input-bordered input-sm"
      placeholder="BRL, USD, real…"
      bind:value={filterState.filterCurrency}
      data-testid="consolidada-filter-currency"
    />
  </label>
  {#if showPatrimonyFilters}
    <div class="flex flex-col gap-1.5 self-end" data-testid="consolidada-patrimony-filters">
      {#if filterAvailability.hasNonInvestment}
        <label class="label cursor-pointer justify-start gap-2">
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            bind:checked={filterState.filterIncludeNonInvestment}
            data-testid="consolidada-filter-non-investment"
          />
          <span class="label-text">Ativos que não são investimento</span>
        </label>
      {/if}
      {#if filterAvailability.hasPension}
        <label class="label cursor-pointer justify-start gap-2">
          <input
            type="checkbox"
            class="checkbox checkbox-sm"
            bind:checked={filterState.filterIncludePension}
            data-testid="consolidada-filter-pension"
          />
          <span class="label-text">Previdência</span>
        </label>
      {/if}
    </div>
  {/if}
</div>

{#if chips.length > 0 || showClear}
  <div class="flex flex-wrap items-center gap-2">
    {#each chips as chip (chip.id)}
      <button
        type="button"
        class="badge badge-outline gap-1 pr-1"
        data-testid="consolidada-filter-chip-{chip.id}"
        on:click={() => dispatch('chipRemove', chip.id)}
      >
        {chip.label}
        <span aria-hidden="true">×</span>
      </button>
    {/each}
    {#if showClear}
      <button
        type="button"
        class="btn btn-ghost btn-xs"
        data-testid="consolidada-clear-filters"
        on:click={() => dispatch('clearAll')}
      >
        Limpar filtros
      </button>
    {/if}
  </div>
{/if}

<details class="text-sm text-base-content/70">
  <summary class="cursor-pointer font-medium text-base-content/80">Como ler valores e moedas</summary>
  <p class="mt-2">
    Moeda: aceita código (BRL, USD) ou termos como «real» ou «dólar». Valores das colunas aplicado/atual: em reais
    quando houver conversão; caso contrário, na moeda da posição.
  </p>
  <p class="mt-2">
    Os cartões de totais mostram subtotais em R$ (moeda BRL) e em US$ (internacional). O consolidado em reais soma tudo
    o que puder ser convertido (BRL nativo + USD × taxa). Sem taxa USD/BRL, linhas em dólar não entram no consolidado.
  </p>
</details>
