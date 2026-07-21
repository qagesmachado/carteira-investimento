<script lang="ts">
  import { page } from '$app/stores';

  import {
    deleteTransaction,
    getMonthSnapshot,
    type BudgetMonthSnapshot
  } from '$lib/api/budget';
  import { parseApiError } from '$lib/api/parseApiError';
  import DismissibleAlert from '$lib/components/DismissibleAlert.svelte';
  import EmptyStateCallout from '$lib/components/EmptyStateCallout.svelte';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import PageSection from '$lib/components/PageSection.svelte';
  import { NO_BUDGET_PROFILE_EMPTY_STATE } from '$lib/features/onboarding/emptyStateCopy';
  import BudgetCategoryCard from '$lib/features/financeiro/BudgetCategoryCard.svelte';
  import { getBudgetLayoutContext } from '$lib/features/financeiro/budgetLayoutContext';
  import {
    DEFAULT_BUDGET_TRANSACTION_FILTERS,
    filterBudgetTransactions,
    uniqueCategoryNames,
    uniqueTagNames,
    type BudgetTransactionFilters
  } from '$lib/features/financeiro/budgetTransactionsView';
  import {
    sortBudgetTransactions,
    toggleSortDirection,
    type BudgetTransactionSortKey,
    type SortDirection
  } from '$lib/features/financeiro/sortBudgetTransactions';
  import DividendTablePagination from '$lib/features/proventos/DividendTablePagination.svelte';
  import {
    DEFAULT_DIVIDEND_PAGE_SIZE,
    paginateList,
    type PageSizeOption
  } from '$lib/features/proventos/paginateList';
  import { formatIsoDateToBr } from '$lib/brDate';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import {
    FINANCEIRO_BUDGET_LUCIDE_ICON,
    FINANCEIRO_GOALS_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  const ctx = getBudgetLayoutContext();
  const { activeProfileId, yearMonth: yearMonthStore } = ctx;

  let snapshot: BudgetMonthSnapshot | null = null;
  let loading = true;
  let error = '';
  let message = '';
  let expandedCategoryId: number | null = null;

  let txFilters: BudgetTransactionFilters = { ...DEFAULT_BUDGET_TRANSACTION_FILTERS };
  let txPage = 1;
  let txPageSize: PageSizeOption = DEFAULT_DIVIDEND_PAGE_SIZE;
  let txSortKey: BudgetTransactionSortKey = 'event_date';
  let txSortDirection: SortDirection = 'desc';

  $: allTransactions = snapshot?.transactions ?? [];
  $: categoryOptions = uniqueCategoryNames(allTransactions);
  $: tagOptions = uniqueTagNames(allTransactions);
  $: filteredTransactions = sortBudgetTransactions(
    filterBudgetTransactions(allTransactions, txFilters),
    txSortKey,
    txSortDirection
  );
  $: txMaxPage = Math.max(1, Math.ceil(filteredTransactions.length / txPageSize) || 1);
  $: if (txPage > txMaxPage) {
    txPage = txMaxPage;
  }
  $: txPagination = paginateList(filteredTransactions, { page: txPage, pageSize: txPageSize });

  function onTxFilterChange() {
    txPage = 1;
  }

  function resetTxFilters() {
    txFilters = { ...DEFAULT_BUDGET_TRANSACTION_FILTERS };
    txPage = 1;
  }

  function handleTxSort(key: BudgetTransactionSortKey) {
    if (txSortKey === key) {
      txSortDirection = toggleSortDirection(txSortDirection);
    } else {
      txSortKey = key;
      txSortDirection = key === 'event_date' || key === 'amount_brl' ? 'desc' : 'asc';
    }
    txPage = 1;
  }

  $: profileId = $activeProfileId;
  $: yearMonth = $page.params.yearMonth ?? $yearMonthStore;

  $: if (yearMonth && yearMonth !== $yearMonthStore) {
    yearMonthStore.set(yearMonth);
  }

  async function loadPage() {
    if (profileId == null) {
      snapshot = null;
      loading = false;
      return;
    }
    loading = true;
    error = '';
    try {
      snapshot = await getMonthSnapshot(profileId, yearMonth);
    } catch (err) {
      snapshot = null;
      error = parseApiError(err, 'Não foi possível carregar o orçamento.');
    } finally {
      loading = false;
    }
  }

  $: if (profileId != null && yearMonth) {
    void loadPage();
  }

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }

  async function handleDeleteExpense(transactionId: number) {
    if (profileId == null) {
      return;
    }
    try {
      await deleteTransaction(profileId, transactionId);
      await loadPage();
      message = 'Despesa excluída.';
    } catch (err) {
      error = parseApiError(err, 'Não foi possível excluir a despesa.');
    }
  }
</script>

<svelte:head>
  <title>Orçamento — Financeiro</title>
</svelte:head>

<div class="flex flex-col gap-3">
{#if error}
  <DismissibleAlert text={error} variant="error" on:dismiss={() => (error = '')} />
{/if}
{#if message}
  <DismissibleAlert text={message} variant="success" on:dismiss={() => (message = '')} />
{/if}

<PageSection testId="financeiro-orcamento-heading">
  <div class="flex items-center gap-2">
    <span class="text-primary" aria-hidden="true">
      <LucideIcon name={FINANCEIRO_BUDGET_LUCIDE_ICON} size="lg" />
    </span>
    <h2 class="card-title text-lg">Orçamento do mês</h2>
  </div>

  {#if profileId == null}
    <EmptyStateCallout
      {...NO_BUDGET_PROFILE_EMPTY_STATE}
      card={false}
      testId="financeiro-orcamento-sem-perfil"
    />
  {:else if loading}
    <span class="loading loading-spinner loading-md"></span>
  {:else if snapshot}
    <div class="grid gap-2 sm:grid-cols-3">
    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Sua renda</div>
      <div class="stat-value text-lg">{formatValue(snapshot.income_total_brl)}</div>
    </div>
    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Gastos do mês</div>
      <div class="stat-value text-lg text-error">{formatValue(snapshot.expense_total_brl)}</div>
      <div class="stat-desc">
        {snapshot.income_usage_percent.toLocaleString('pt-BR', { maximumFractionDigits: 1 })}% da renda
      </div>
    </div>
    <div class="stat rounded-box bg-base-100 shadow">
      <div class="stat-title">Saldo restante</div>
      <div class="stat-value text-lg {snapshot.remaining_brl >= 0 ? 'text-success' : 'text-error'}">
        {formatValue(snapshot.remaining_brl)}
      </div>
    </div>
    </div>
  {/if}
</PageSection>

{#if profileId != null && snapshot}
  <PageSection>
    <div class="flex items-center gap-2">
      <span class="text-primary" aria-hidden="true">
        <LucideIcon name={FINANCEIRO_GOALS_LUCIDE_ICON} size="lg" />
      </span>
      <h3 class="card-title text-lg">Metas financeiras</h3>
    </div>
    <div class="grid gap-2 lg:grid-cols-2">
      {#each snapshot.categories as category (category.category_id)}
        <BudgetCategoryCard
          {category}
          transactions={snapshot.transactions}
          expanded={expandedCategoryId === category.category_id}
          on:toggle={(event) => {
            expandedCategoryId = expandedCategoryId === event.detail ? null : event.detail;
          }}
          on:delete={(event) => void handleDeleteExpense(event.detail)}
        />
      {/each}
    </div>
  </PageSection>

  <PageSection>
    <div class="flex flex-wrap items-center justify-between gap-2">
      <div class="flex items-center gap-2">
        <span class="text-primary" aria-hidden="true">
          <LucideIcon name="ScrollText" size="lg" />
        </span>
        <h3 class="card-title text-lg">Transações recentes</h3>
      </div>
      <span class="badge badge-neutral" data-testid="budget-transactions-count">
        {txPagination.totalItems}
        {txPagination.totalItems === 1 ? 'transação' : 'transações'}
      </span>
    </div>

    <div class="flex flex-wrap items-end gap-2" data-testid="budget-transactions-filters">
      <label class="form-control w-full sm:w-56">
        <span class="label-text text-xs">Buscar descrição</span>
        <input
          type="text"
          class="input input-bordered input-sm"
          placeholder="Ex.: Aluguel"
          bind:value={txFilters.search}
          on:input={onTxFilterChange}
          data-testid="budget-transactions-search"
        />
      </label>
      <label class="form-control">
        <span class="label-text text-xs">Meta</span>
        <select class="select select-bordered select-sm" bind:value={txFilters.categoryName} on:change={onTxFilterChange} data-testid="budget-transactions-category">
          <option value="">Todas</option>
          {#each categoryOptions as name}
            <option value={name}>{name}</option>
          {/each}
        </select>
      </label>
      <label class="form-control">
        <span class="label-text text-xs">Tag</span>
        <select class="select select-bordered select-sm" bind:value={txFilters.tagName} on:change={onTxFilterChange} data-testid="budget-transactions-tag">
          <option value="">Todas</option>
          {#each tagOptions as name}
            <option value={name}>{name}</option>
          {/each}
        </select>
      </label>
      <button
        type="button"
        class="btn btn-ghost btn-sm"
        on:click={resetTxFilters}
        data-testid="budget-transactions-reset"
      >
        Limpar
      </button>
    </div>

    {#if txPagination.totalItems === 0}
      <p class="py-6 text-center text-sm text-base-content/60" data-testid="budget-transactions-empty">
        Nenhuma transação encontrada com os filtros atuais.
      </p>
    {:else}
      <DividendTablePagination
        position="top"
        ariaLabel="Paginação de transações (topo)"
        emptyRangeLabel="Nenhuma transação na página"
        bind:page={txPage}
        bind:pageSize={txPageSize}
        totalPages={txPagination.totalPages}
        totalItems={txPagination.totalItems}
        rangeStart={txPagination.rangeStart}
        rangeEnd={txPagination.rangeEnd}
      />

      <div class="overflow-x-auto">
        <table class="table table-zebra table-sm">
          <thead>
            <tr>
              <th>
                <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleTxSort('event_date')}>
                  Data
                  {#if txSortKey === 'event_date'}
                    <LucideIcon name={txSortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                  {/if}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleTxSort('description')}>
                  Descrição
                  {#if txSortKey === 'description'}
                    <LucideIcon name={txSortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                  {/if}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleTxSort('tag_name')}>
                  Tag
                  {#if txSortKey === 'tag_name'}
                    <LucideIcon name={txSortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                  {/if}
                </button>
              </th>
              <th>
                <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleTxSort('category_name')}>
                  Meta
                  {#if txSortKey === 'category_name'}
                    <LucideIcon name={txSortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                  {/if}
                </button>
              </th>
              <th class="text-end">
                <button type="button" class="btn btn-ghost btn-xs ml-auto h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleTxSort('amount_brl')}>
                  Valor
                  {#if txSortKey === 'amount_brl'}
                    <LucideIcon name={txSortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                  {/if}
                </button>
              </th>
            </tr>
          </thead>
          <tbody data-testid="budget-transactions-list">
            {#each txPagination.items as tx (tx.id)}
              <tr>
                <td class="whitespace-nowrap tabular-nums text-base-content/70">
                  {formatIsoDateToBr(tx.event_date)}
                </td>
                <td>{tx.description}</td>
                <td>
                  {#if tx.tag_name}
                    <span class="badge badge-sm" style:background-color={tx.tag_color ?? undefined}>
                      {tx.tag_name}
                    </span>
                  {/if}
                </td>
                <td class="text-base-content/70">{tx.category_name ?? '—'}</td>
                <td class="whitespace-nowrap text-end font-medium tabular-nums text-error">
                  {formatValue(tx.amount_brl)}
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <DividendTablePagination
        position="bottom"
        ariaLabel="Paginação de transações"
        emptyRangeLabel="Nenhuma transação na página"
        bind:page={txPage}
        bind:pageSize={txPageSize}
        totalPages={txPagination.totalPages}
        totalItems={txPagination.totalItems}
        rangeStart={txPagination.rangeStart}
        rangeEnd={txPagination.rangeEnd}
      />
    {/if}
  </PageSection>
{/if}
</div>
