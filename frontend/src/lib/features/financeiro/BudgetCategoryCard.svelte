<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { BudgetCategoryKpi, BudgetTransaction } from '$lib/api/budget';
  import { formatIsoDateToBr } from '$lib/brDate';
  import LucideIcon from '$lib/components/LucideIcon.svelte';
  import { PROVENTOS_REMOVE_LUCIDE_ICON } from '$lib/icons/lucideIconCatalog';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  import {
    sortBudgetTransactions,
    toggleSortDirection,
    type BudgetTransactionSortKey,
    type SortDirection
  } from './sortBudgetTransactions';

  export let category: BudgetCategoryKpi;
  export let transactions: BudgetTransaction[] = [];
  export let expanded = false;

  const dispatch = createEventDispatcher<{ toggle: number; delete: number }>();

  let sortKey: BudgetTransactionSortKey = 'event_date';
  let sortDirection: SortDirection = 'desc';

  function handleSort(key: BudgetTransactionSortKey) {
    if (sortKey === key) {
      sortDirection = toggleSortDirection(sortDirection);
    } else {
      sortKey = key;
      sortDirection = key === 'event_date' || key === 'amount_brl' ? 'desc' : 'asc';
    }
  }

  $: categoryTransactions = transactions.filter(
    (tx) => tx.transaction_type === 'expense' && tx.category_id === category.category_id
  );

  $: sortedTransactions = sortBudgetTransactions(categoryTransactions, sortKey, sortDirection);

  function formatValue(value: number): string {
    if ($hideMoneyValues) {
      return 'R$ ••••••';
    }
    return formatBrl(value);
  }

  function statusBadge(): { label: string; className: string } {
    if (category.spent_brl <= 0) {
      return { label: 'Sem gastos', className: 'badge-ghost' };
    }
    if (category.exceeded) {
      return { label: 'Excedido', className: 'badge-error' };
    }
    return {
      label: `${category.usage_percent.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}% usado`,
      className: 'badge-success'
    };
  }

  $: badge = statusBadge();
</script>

<article class="card bg-base-100 shadow" data-testid="budget-category-card-{category.category_id}">
  <div class="card-body gap-3">
    <div class="flex flex-wrap items-start justify-between gap-2">
      <div>
        <div class="flex flex-wrap items-center gap-2">
          <h3 class="font-semibold" style:color={category.color}>{category.category_name}</h3>
          {#if category.transaction_count > 0}
            <span class="badge badge-neutral" data-testid="budget-category-item-count">
              {category.transaction_count}
              {category.transaction_count === 1 ? 'item' : 'itens'}
            </span>
          {/if}
        </div>
        <span class="badge badge-sm {badge.className}">{badge.label}</span>
      </div>
      <button
        type="button"
        class="btn btn-ghost btn-xs"
        on:click={() => dispatch('toggle', category.category_id)}
      >
        {expanded ? 'Recolher' : 'Ver itens'}
      </button>
    </div>

    <progress
      class="progress w-full {category.exceeded ? 'progress-error' : 'progress-success'}"
      value={Math.min(category.usage_percent, 100)}
      max="100"
    ></progress>

    <div class="grid grid-cols-3 gap-2 text-sm">
      <div>
        <p class="text-base-content/60">Gasto</p>
        <p class="font-medium tabular-nums">{formatValue(category.spent_brl)}</p>
      </div>
      <div>
        <p class="text-base-content/60">Previsto</p>
        <p class="font-medium tabular-nums">{formatValue(category.target_brl)}</p>
      </div>
      <div>
        <p class="text-base-content/60">Restante</p>
        <p class="font-medium tabular-nums {category.remaining_brl < 0 ? 'text-error' : 'text-success'}">
          {formatValue(category.remaining_brl)}
        </p>
      </div>
    </div>

    {#if expanded}
      {#if categoryTransactions.length === 0}
        <p class="rounded border border-base-300 p-3 text-sm text-base-content/60">
          Nenhum lançamento nesta meta.
        </p>
      {:else}
        <div class="overflow-x-auto rounded border border-base-300">
          <table class="table table-sm">
            <thead>
              <tr class="text-base-content/60">
                <th class="font-medium">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-medium normal-case"
                    aria-sort={sortKey === 'event_date' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                    on:click={() => handleSort('event_date')}
                  >
                    Data
                    {#if sortKey === 'event_date'}
                      <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                    {/if}
                  </button>
                </th>
                <th class="font-medium">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-medium normal-case"
                    aria-sort={sortKey === 'description' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                    on:click={() => handleSort('description')}
                  >
                    Descrição
                    {#if sortKey === 'description'}
                      <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                    {/if}
                  </button>
                </th>
                <th class="font-medium">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs h-auto min-h-0 gap-1 px-1 font-medium normal-case"
                    aria-sort={sortKey === 'tag_name' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                    on:click={() => handleSort('tag_name')}
                  >
                    Tag
                    {#if sortKey === 'tag_name'}
                      <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                    {/if}
                  </button>
                </th>
                <th class="text-right font-medium">
                  <button
                    type="button"
                    class="btn btn-ghost btn-xs ml-auto h-auto min-h-0 gap-1 px-1 font-medium normal-case"
                    aria-sort={sortKey === 'amount_brl' ? (sortDirection === 'asc' ? 'ascending' : 'descending') : undefined}
                    on:click={() => handleSort('amount_brl')}
                  >
                    Valor
                    {#if sortKey === 'amount_brl'}
                      <LucideIcon name={sortDirection === 'asc' ? 'ArrowUp' : 'ArrowDown'} size="sm" />
                    {/if}
                  </button>
                </th>
                <th class="w-px"></th>
              </tr>
            </thead>
            <tbody>
              {#each sortedTransactions as tx (tx.id)}
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
                  <td class="whitespace-nowrap text-right font-medium tabular-nums text-error">
                    {formatValue(tx.amount_brl)}
                  </td>
                  <td class="w-px whitespace-nowrap text-right">
                    <button
                      type="button"
                      class="btn btn-outline btn-xs flex-nowrap gap-1 whitespace-nowrap text-error"
                      on:click={() => dispatch('delete', tx.id)}
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
      {/if}
    {/if}
  </div>
</article>
