<script lang="ts">
  import type { AssetMarket } from '$lib/api/assets';
  import type { DividendPayment } from '$lib/api/dividendPayments';
  import type { Portfolio } from '$lib/api/portfolios';
  import {
    formatIsoDateToBr,
    parseBrDateToIso,
    sanitizeBrDateTyping
  } from '$lib/brDate';
  import { formatTickerForDisplay } from '$lib/formatTickerForDisplay';
  import {
    formatMarketForDisplay,
    formatPaymentTypeForDisplay,
    marketFilterOptions,
    paymentTypeOptions,
    type DividendPaymentType
  } from '$lib/proventoLabels';
  import { hiddenMoneyForCurrency, isMoneyHidden } from '$lib/moneyDisplay';

  import DividendPaymentsSummary from './DividendPaymentsSummary.svelte';
  import DividendTablePagination from './DividendTablePagination.svelte';
  import {
    formatDividendPaymentsTotalAmounts,
    formatDividendPaymentsTotalLabel,
    summarizeDividendPayments
  } from './dividendSummary';
  import { filterDividendPayments } from './filterDividendPayments';
  import {
    collectPaymentYears,
    filterDividendPaymentsByYear
  } from './filterDividendPaymentsByYear';
  import {
    DEFAULT_DIVIDEND_PAGE_SIZE,
    paginateList,
    type PageSizeOption
  } from './paginateList';
  import {
    sortDividendPayments,
    toggleSortDirection,
    type DividendPaymentSortKey,
    type SortDirection
  } from './sortDividendPayments';

  export let payments: DividendPayment[] = [];
  export let portfolios: Portfolio[] = [];
  export let portfolioFilter: number | '' = '';
  export let onEdit: (payment: DividendPayment) => void = () => undefined;
  export let onDelete: (payment: DividendPayment) => void = () => undefined;
  export let onServerFiltersChange: (filters: {
    portfolio_id?: number;
    payment_type?: DividendPaymentType;
    market?: AssetMarket;
    from_date?: string;
    to_date?: string;
  }) => void = () => undefined;

  let searchQuery = '';
  let debouncedQuery = '';
  let filterType: '' | DividendPaymentType = '';
  let filterMarket: '' | AssetMarket = '';
  let filterYear = '';
  let filterFromDateBr = '';
  let filterToDateBr = '';
  let sortKey: DividendPaymentSortKey = 'payment_date';
  let sortDirection: SortDirection = 'desc';
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

  function emitServerFilters() {
    const fromIso = parseBrDateToIso(filterFromDateBr);
    const toIso = parseBrDateToIso(filterToDateBr);
    onServerFiltersChange({
      portfolio_id: portfolioFilter === '' ? undefined : Number(portfolioFilter),
      payment_type: filterType || undefined,
      market: filterMarket || undefined,
      from_date: fromIso || undefined,
      to_date: toIso || undefined
    });
    resetPagination();
  }

  function handlePortfolioFilterChange(event: Event) {
    const value = (event.target as HTMLSelectElement).value;
    portfolioFilter = value === '' ? '' : Number(value);
    emitServerFilters();
  }

  function portfolioNameFor(id: number | null): string {
    if (id == null) return 'Sem carteira';
    return portfolios.find((p) => p.id === id)?.name ?? `#${id}`;
  }

  function handleTypeChange(event: Event) {
    filterType = (event.target as HTMLSelectElement).value as '' | DividendPaymentType;
    emitServerFilters();
  }

  function handleMarketChange(event: Event) {
    filterMarket = (event.target as HTMLSelectElement).value as '' | AssetMarket;
    emitServerFilters();
  }

  function handleYearChange(event: Event) {
    filterYear = (event.target as HTMLSelectElement).value;
    resetPagination();
  }

  function handleFromDateInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    filterFromDateBr = sanitizeBrDateTyping(target.value);
    target.value = filterFromDateBr;
  }

  function blurNormalizeFromDate() {
    const iso = parseBrDateToIso(filterFromDateBr);
    if (iso) {
      filterFromDateBr = formatIsoDateToBr(iso);
    }
    emitServerFilters();
  }

  function clearFromDate() {
    filterFromDateBr = '';
    emitServerFilters();
  }

  function handleToDateInput(event: Event) {
    const target = event.currentTarget as HTMLInputElement;
    filterToDateBr = sanitizeBrDateTyping(target.value);
    target.value = filterToDateBr;
  }

  function blurNormalizeToDate() {
    const iso = parseBrDateToIso(filterToDateBr);
    if (iso) {
      filterToDateBr = formatIsoDateToBr(iso);
    }
    emitServerFilters();
  }

  function clearToDate() {
    filterToDateBr = '';
    emitServerFilters();
  }

  function handleSort(key: DividendPaymentSortKey) {
    if (sortKey === key) {
      sortDirection = toggleSortDirection(sortDirection);
    } else {
      sortKey = key;
      sortDirection = key === 'payment_date' ? 'desc' : 'asc';
    }
    resetPagination();
  }

  function sortIndicator(key: DividendPaymentSortKey): string {
    if (sortKey !== key) {
      return '';
    }
    return sortDirection === 'asc' ? ' ↑' : ' ↓';
  }

  function formatAmount(amount: number, currency: string): string {
    const code = currency.length === 3 ? currency : 'BRL';
    if (isMoneyHidden()) {
      return hiddenMoneyForCurrency(code);
    }
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: code
    }).format(amount);
  }

  function formatDate(isoDate: string): string {
    const [y, m, d] = isoDate.split('-');
    if (!y || !m || !d) {
      return isoDate;
    }
    return `${d}/${m}/${y}`;
  }

  $: filteredByText = filterDividendPayments(payments, debouncedQuery);
  $: filtered = filterDividendPaymentsByYear(filteredByText, filterYear);
  $: sorted = sortDividendPayments(filtered, sortKey, sortDirection);
  $: maxPage = Math.max(1, Math.ceil(sorted.length / pageSize) || 1);
  $: if (currentPage > maxPage) {
    currentPage = maxPage;
  }
  $: pagination = paginateList(sorted, { page: currentPage, pageSize });
  $: displayed = pagination.items;
  $: filteredTotals = summarizeDividendPayments(filtered);
  $: availableYears = collectPaymentYears(payments);
  $: hasTextFilter = debouncedQuery.trim().length > 0;
  $: hasServerFilter = Boolean(
    filterType || filterMarket || filterFromDateBr.trim() || filterToDateBr.trim() || portfolioFilter !== ''
  );
  $: hasYearFilter = Boolean(filterYear);
  $: hasAnyFilter = hasTextFilter || hasServerFilter || hasYearFilter;
</script>

<section class="card bg-base-100 shadow-xl">
  <div class="card-body">
    <div class="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
      <div>
        <p class="text-sm font-semibold uppercase tracking-wide text-primary">Lançamentos</p>
        <h2 class="card-title">Proventos cadastrados</h2>
      </div>
      <span class="badge badge-neutral">
        {#if hasAnyFilter || filtered.length !== payments.length}
          {filtered.length} de {payments.length} lançamentos
        {:else}
          {payments.length} lançamentos
        {/if}
      </span>
    </div>

    <div class="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      <label class="form-control">
        <span class="label"><span class="label-text">Carteira</span></span>
        <select
          class="select select-bordered"
          value={portfolioFilter === '' ? '' : String(portfolioFilter)}
          on:change={handlePortfolioFilterChange}
          aria-label="Filtrar por carteira"
        >
          <option value="">Todas as carteiras</option>
          {#each portfolios as portfolio (portfolio.id)}
            <option value={String(portfolio.id)}>{portfolio.name}</option>
          {/each}
        </select>
      </label>

      <label class="form-control">
        <span class="label"><span class="label-text">Buscar ativo</span></span>
        <input
          class="input input-bordered"
          type="search"
          placeholder="Ticker ou nome"
          value={searchQuery}
          on:input={onSearchInput}
        />
      </label>

      <label class="form-control">
        <span class="label"><span class="label-text">Ano</span></span>
        <select class="select select-bordered" value={filterYear} on:change={handleYearChange}>
          <option value="">Todos os anos</option>
          {#each availableYears as year}
            <option value={year}>{year}</option>
          {/each}
        </select>
      </label>

      <label class="form-control">
        <span class="label"><span class="label-text">Tipo</span></span>
        <select class="select select-bordered" value={filterType} on:change={handleTypeChange}>
          <option value="">Todos os tipos</option>
          {#each paymentTypeOptions() as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="form-control">
        <span class="label"><span class="label-text">Mercado</span></span>
        <select class="select select-bordered" value={filterMarket} on:change={handleMarketChange}>
          {#each marketFilterOptions() as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </label>

      <label class="form-control">
        <span class="label">
          <span class="label-text">Data inicial</span>
          {#if filterFromDateBr}
            <button type="button" class="label-text-alt link" on:click={clearFromDate}>Limpar</button>
          {/if}
        </span>
        <input
          class="input input-bordered font-mono"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="DD/MM/AAAA"
          value={filterFromDateBr}
          maxlength="10"
          on:input={handleFromDateInput}
          on:blur={blurNormalizeFromDate}
        />
      </label>

      <label class="form-control">
        <span class="label">
          <span class="label-text">Data final</span>
          {#if filterToDateBr}
            <button type="button" class="label-text-alt link" on:click={clearToDate}>Limpar</button>
          {/if}
        </span>
        <input
          class="input input-bordered font-mono"
          type="text"
          inputmode="numeric"
          autocomplete="off"
          placeholder="DD/MM/AAAA"
          value={filterToDateBr}
          maxlength="10"
          on:input={handleToDateInput}
          on:blur={blurNormalizeToDate}
        />
      </label>
    </div>

    <p class="text-xs text-base-content/60">
      Filtro de período em DD/MM/AAAA. O filtro de ano considera todos os lançamentos já carregados
      (após tipo, mercado e período no servidor).
    </p>

    {#if payments.length === 0}
      <div class="alert">
        <span>Nenhum provento cadastrado ainda.</span>
      </div>
    {:else if filtered.length === 0}
      <div class="alert">
        <span>
          {#if hasAnyFilter}
            Nenhum provento corresponde aos filtros aplicados.
          {:else}
            Nenhum provento para exibir.
          {/if}
        </span>
      </div>
    {:else}
      <DividendPaymentsSummary totals={filteredTotals} />

      <DividendTablePagination
        position="top"
        bind:page={currentPage}
        bind:pageSize
        totalPages={pagination.totalPages}
        totalItems={pagination.totalItems}
        rangeStart={pagination.rangeStart}
        rangeEnd={pagination.rangeEnd}
      />

      <div class="overflow-x-auto">
        <table class="table table-zebra">
          <thead>
            <tr>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handleSort('payment_date')}>
                  Data{sortIndicator('payment_date')}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handleSort('symbol')}>
                  Ativo{sortIndicator('symbol')}
                </button>
              </th>
              <th>Nome</th>
              <th>Carteira</th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handleSort('payment_type')}>
                  Tipo{sortIndicator('payment_type')}
                </button>
              </th>
              <th class="text-end">
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handleSort('amount')}>
                  Valor{sortIndicator('amount')}
                </button>
              </th>
              <th>Moeda</th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs" on:click={() => handleSort('market')}>
                  Mercado{sortIndicator('market')}
                </button>
              </th>
              <th class="text-end">Ações</th>
            </tr>
          </thead>
          <tbody>
            {#each displayed as payment (payment.id)}
              <tr>
                <td>{formatDate(payment.payment_date)}</td>
                <td class="font-mono">{formatTickerForDisplay(payment.symbol)}</td>
                <td>{payment.asset_name}</td>
                <td class="text-sm">{portfolioNameFor(payment.portfolio_id)}</td>
                <td>{formatPaymentTypeForDisplay(payment.payment_type)}</td>
                <td class="text-end">{formatAmount(payment.amount, payment.currency)}</td>
                <td>{payment.currency}</td>
                <td>{formatMarketForDisplay(payment.market)}</td>
                <td class="text-end">
                  <button class="btn btn-ghost btn-sm" type="button" on:click={() => onEdit(payment)}>
                    Editar
                  </button>
                  <button
                    class="btn btn-ghost btn-sm text-error"
                    type="button"
                    on:click={() => onDelete(payment)}
                  >
                    Remover
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
          <tfoot>
            <tr class="bg-base-200 font-semibold">
              <td colspan="5">{formatDividendPaymentsTotalLabel(filteredTotals)}</td>
              <td class="text-end tabular-nums">
                {formatDividendPaymentsTotalAmounts(filteredTotals)}
              </td>
              <td>
                {Object.keys(filteredTotals.totalByCurrency).sort().join(' · ') || '—'}
              </td>
              <td colspan="2" />
            </tr>
          </tfoot>
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
      />
    {/if}
  </div>
</section>
