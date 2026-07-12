<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  import type { BudgetCategoryKpi, BudgetTransaction } from '$lib/api/budget';
  import { formatIsoDateToBr } from '$lib/brDate';
  import { formatBrl } from '$lib/features/rebalance/allocationTargets';
  import { hideMoneyValues } from '$lib/stores/hideMoneyValues';

  export let category: BudgetCategoryKpi;
  export let transactions: BudgetTransaction[] = [];
  export let expanded = false;

  const dispatch = createEventDispatcher<{ toggle: number; delete: number }>();

  $: categoryTransactions = transactions.filter(
    (tx) => tx.transaction_type === 'expense' && tx.category_id === category.category_id
  );

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
      <ul class="divide-y rounded border border-base-300 text-sm">
        {#if categoryTransactions.length === 0}
          <li class="p-3 text-base-content/60">Nenhum lançamento nesta meta.</li>
        {:else}
          {#each categoryTransactions as tx (tx.id)}
            <li class="flex flex-wrap items-center gap-2 p-3">
              <span class="text-base-content/70">{formatIsoDateToBr(tx.event_date)}</span>
              <span class="flex-1">{tx.description}</span>
              {#if tx.tag_name}
                <span class="badge badge-sm" style:background-color={tx.tag_color ?? undefined}>
                  {tx.tag_name}
                </span>
              {/if}
              <span class="font-medium tabular-nums text-error">{formatValue(tx.amount_brl)}</span>
              <button
                type="button"
                class="btn btn-ghost btn-xs text-error"
                on:click={() => dispatch('delete', tx.id)}
              >
                Excluir
              </button>
            </li>
          {/each}
        {/if}
      </ul>
    {/if}
  </div>
</article>
