<script lang="ts">
  import type { BudgetRecurringExpense } from '$lib/api/budget';
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
    filterRecurringExpenses,
    uniqueNames,
    type BudgetExpenseFilterState
  } from './budgetExpenseFilters';
  import { formatRecurringEndLabel } from './budgetExpenseRows';
  import { formatYearMonthLabel } from './budgetMonth';
  import {
    sortBudgetRecurringExpenses,
    type RecurringExpenseSortKey
  } from './sortBudgetRecurringExpenses';
  import { toggleSortDirection, type SortDirection } from './sortBudgetTransactions';
  import DividendTablePagination from '$lib/features/proventos/DividendTablePagination.svelte';
  import {
    DEFAULT_DIVIDEND_PAGE_SIZE,
    paginateList,
    type PageSizeOption
  } from '$lib/features/proventos/paginateList';

  export let rules: BudgetRecurringExpense[] = [];
  export let emptyLabel = 'Nenhuma despesa recorrente cadastrada.';
  export let filterTestId: string | undefined = undefined;
  export let rowTestIdPrefix: string | undefined = undefined;
  export let deleteTestIdPrefix: string | undefined = undefined;
  export let onEditRecurring: (rule: BudgetRecurringExpense) => void = () => undefined;
  export let onDeleteRecurring: (rule: BudgetRecurringExpense) => void = () => undefined;

  let filters: BudgetExpenseFilterState = { ...DEFAULT_BUDGET_EXPENSE_FILTER };
  let sortKey: RecurringExpenseSortKey = 'day_of_month';
  let sortDirection: SortDirection = 'asc';
  let currentPage = 1;
  let pageSize: PageSizeOption = DEFAULT_DIVIDEND_PAGE_SIZE;

  $: categoryOptions = uniqueNames(rules.map((r) => r.category_name));
  $: tagOptions = uniqueNames(rules.map((r) => r.tag_name));
  $: filtered = sortBudgetRecurringExpenses(
    filterRecurringExpenses(rules, filters),
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

  function handleSort(key: RecurringExpenseSortKey) {
    if (sortKey === key) {
      sortDirection = toggleSortDirection(sortDirection);
    } else {
      sortKey = key;
      sortDirection = key === 'amount_brl' || key === 'day_of_month' ? 'desc' : 'asc';
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

{#if rules.length === 0}
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
      ariaLabel="{filterTestId ?? 'Recorrentes'} paginação (topo)"
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
              <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleSort('day_of_month')}>
                Dia
                {#if sortKey === 'day_of_month'}
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
            <th>
              <button type="button" class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-normal normal-case" on:click={() => handleSort('start_year_month')}>
                Início
                {#if sortKey === 'start_year_month'}
                  <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                {/if}
              </button>
            </th>
            <th>Término</th>
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
          {#each pagination.items as rule (rule.id)}
            <tr data-testid={rowTestIdPrefix ? `${rowTestIdPrefix}-${rule.id}` : undefined}>
              <td class="whitespace-nowrap tabular-nums">{rule.day_of_month}</td>
              <td>{rule.description}</td>
              <td>{rule.category_name ?? '—'}</td>
              <td>{rule.tag_name ?? '—'}</td>
              <td class="whitespace-nowrap">{formatYearMonthLabel(rule.start_year_month)}</td>
              <td class="whitespace-nowrap">{formatRecurringEndLabel(rule)}</td>
              <td class="text-end tabular-nums text-error">{formatValue(rule.amount_brl)}</td>
              <td class="space-x-2 text-right">
                <button type="button" class="btn btn-outline btn-xs gap-1" on:click={() => onEditRecurring(rule)}>
                  <LucideIcon name={PROVENTOS_EDIT_LUCIDE_ICON} size="sm" aria-hidden="true" />
                  Editar
                </button>
                <button
                  type="button"
                  class="btn btn-outline btn-xs gap-1 text-error"
                  data-testid={deleteTestIdPrefix ? `${deleteTestIdPrefix}-${rule.id}` : undefined}
                  on:click={() => onDeleteRecurring(rule)}
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
      ariaLabel="{filterTestId ?? 'Recorrentes'} paginação"
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
