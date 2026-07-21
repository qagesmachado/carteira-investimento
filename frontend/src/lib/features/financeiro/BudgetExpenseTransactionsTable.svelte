<script lang="ts">
  import type { BudgetTransaction } from '$lib/api/budget';
  import { formatIsoDateToBr } from '$lib/brDate';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import {
    PROVENTOS_EDIT_LUCIDE_ICON,
    PROVENTOS_REMOVE_LUCIDE_ICON
  } from '$lib/icons/lucideIconCatalog';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  import BudgetExpenseFilterBar from './BudgetExpenseFilterBar.svelte';
  import {
    DEFAULT_BUDGET_EXPENSE_FILTER,
    filterExpenseTransactions,
    uniqueNames,
    type BudgetExpenseFilterState
  } from './budgetExpenseFilters';
  import {
    sortBudgetTransactions,
    toggleSortDirection,
    type BudgetTransactionSortKey,
    type SortDirection
  } from './sortBudgetTransactions';
  import DividendTablePagination from '$lib/features/proventos/DividendTablePagination.svelte';
  import {
    DEFAULT_DIVIDEND_PAGE_SIZE,
    paginateList,
    type PageSizeOption
  } from '$lib/features/proventos/paginateList';

  export let rows: BudgetTransaction[] = [];
  export let showType = false;
  export let emptyLabel = 'Nenhuma despesa neste mês.';
  export let filterTestId: string | undefined = undefined;
  export let rowTestIdPrefix: string | undefined = undefined;
  export let deleteTestIdPrefix: string | undefined = undefined;
  export let onEditExpense: (expense: BudgetTransaction) => void = () => undefined;
  export let onDeleteExpense: (expense: BudgetTransaction) => void = () => undefined;

  let filters: BudgetExpenseFilterState = { ...DEFAULT_BUDGET_EXPENSE_FILTER };
  let sortKey: BudgetTransactionSortKey = 'event_date';
  let sortDirection: SortDirection = 'desc';
  let currentPage = 1;
  let pageSize: PageSizeOption = DEFAULT_DIVIDEND_PAGE_SIZE;

  $: categoryOptions = uniqueNames(rows.map((r) => r.category_name));
  $: tagOptions = uniqueNames(rows.map((r) => r.tag_name));
  $: filtered = sortBudgetTransactions(
    filterExpenseTransactions(rows, filters),
    sortKey,
    sortDirection
  );
  $: maxPage = Math.max(1, Math.ceil(filtered.length / pageSize) || 1);
  $: if (currentPage > maxPage) {
    currentPage = maxPage;
  }
  $: pagination = paginateList(filtered, { page: currentPage, pageSize });

  function onFilterChange() {
    currentPage = 1;
  }

  function handleSort(key: BudgetTransactionSortKey) {
    if (sortKey === key) {
      sortDirection = toggleSortDirection(sortDirection);
    } else {
      sortKey = key;
      sortDirection = key === 'event_date' || key === 'amount_brl' ? 'desc' : 'asc';
    }
    currentPage = 1;
  }

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }
</script>

{#if rows.length === 0}
  <p class="pt-2 text-sm text-base-content/60">{emptyLabel}</p>
{:else}
  <BudgetExpenseFilterBar
    bind:filters
    {categoryOptions}
    {tagOptions}
    testId={filterTestId}
    onChange={onFilterChange}
  />

  {#if pagination.totalItems === 0}
    <p class="pt-2 text-sm text-base-content/60">Nenhuma despesa corresponde aos filtros.</p>
  {:else}
    <DividendTablePagination
      position="top"
      ariaLabel="{filterTestId ?? 'Despesas'} paginação (topo)"
      emptyRangeLabel="Nenhuma despesa na página"
      bind:page={currentPage}
      bind:pageSize
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      rangeStart={pagination.rangeStart}
      rangeEnd={pagination.rangeEnd}
    />

    <div class="overflow-x-auto">
      <table class="table table-zebra table-sm">
        <thead>
          <tr>
            <th>
              <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleSort('event_date')}>
                Data
                {#if sortKey === 'event_date'}
                  <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                {/if}
              </button>
            </th>
            <th>
              <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleSort('description')}>
                Descrição
                {#if sortKey === 'description'}
                  <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                {/if}
              </button>
            </th>
            {#if showType}
              <th>Tipo</th>
            {/if}
            <th>
              <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleSort('category_name')}>
                Meta
                {#if sortKey === 'category_name'}
                  <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                {/if}
              </button>
            </th>
            <th>
              <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleSort('tag_name')}>
                Tag
                {#if sortKey === 'tag_name'}
                  <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                {/if}
              </button>
            </th>
            <th class="text-end">
              <button type="button" class="btn btn-ghost btn-xs ml-auto h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleSort('amount_brl')}>
                Valor
                {#if sortKey === 'amount_brl'}
                  <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                {/if}
              </button>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {#each pagination.items as expense (expense.id)}
            <tr data-testid={rowTestIdPrefix ? `${rowTestIdPrefix}-${expense.id}` : undefined}>
              <td class="whitespace-nowrap tabular-nums">{formatIsoDateToBr(expense.event_date)}</td>
              <td>{expense.description}</td>
              {#if showType}
                <td>{expense.recurring ? 'Recorrente' : 'Pontual'}</td>
              {/if}
              <td>{expense.category_name ?? '—'}</td>
              <td>{expense.tag_name ?? '—'}</td>
              <td class="text-end tabular-nums text-error">{formatValue(expense.amount_brl)}</td>
              <td class="space-x-2 text-right">
                <button type="button" class="btn btn-outline btn-xs gap-1" on:click={() => onEditExpense(expense)}>
                  <LucideIcon name={PROVENTOS_EDIT_LUCIDE_ICON} size="sm" aria-hidden="true" />
                  Editar
                </button>
                <button
                  type="button"
                  class="btn btn-outline btn-xs gap-1 text-error"
                  data-testid={deleteTestIdPrefix ? `${deleteTestIdPrefix}-${expense.id}` : undefined}
                  on:click={() => onDeleteExpense(expense)}
                >
                  <LucideIcon name={PROVENTOS_REMOVE_LUCIDE_ICON} size="sm" aria-hidden="true" />
                  Excluir
                </button>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <DividendTablePagination
      position="bottom"
      ariaLabel="{filterTestId ?? 'Despesas'} paginação"
      emptyRangeLabel="Nenhuma despesa na página"
      bind:page={currentPage}
      bind:pageSize
      totalPages={pagination.totalPages}
      totalItems={pagination.totalItems}
      rangeStart={pagination.rangeStart}
      rangeEnd={pagination.rangeEnd}
    />
  {/if}
{/if}
